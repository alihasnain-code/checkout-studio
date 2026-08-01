import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Layers, FileText } from "lucide-react";

const DISPLAY_STYLES = [
    { id: "progressbar", title: "4-Step Progress Bar", desc: "Visual timeline (Order placed → Packed → Shipped → Delivered)", Icon: Layers },
    { id: "simple", title: "Simple Status Text", desc: "Clean status label with tracking code badge", Icon: FileText },
];

const CARRIER_OPTIONS = [
    "Shopify Logistics / DHL",
    "FedEx Express",
    "UPS Ground",
    "USPS Priority Mail",
    "Shop Pay Fulfillment",
    "Royal Mail",
    "Canada Post",
];

const STEPS = [
    { step: 1, label: "1. Placed" },
    { step: 2, label: "2. Packed" },
    { step: 3, label: "3. Shipped" },
    { step: 4, label: "4. Delivered" },
];

const SAVE_BAR_ID = "order-tracking-save-bar";

export default function OrderTrackingForm({ enabled: initialEnabled, config: initialConfig }) {
    const fetcher = useFetcher();
    const [enabled, setEnabled] = useState(initialEnabled);
    const [config, setConfig] = useState(initialConfig);
    const [saved, setSaved] = useState({ enabled: initialEnabled, config: initialConfig });

    const isDirty = JSON.stringify({ enabled, config }) !== JSON.stringify(saved);

    useEffect(() => {
        if (isDirty) shopify.saveBar.show(SAVE_BAR_ID);
        else shopify.saveBar.hide(SAVE_BAR_ID);
    }, [isDirty]);

    useEffect(() => {
        if (fetcher.state !== "idle" || !fetcher.data) return;
        if (fetcher.data.ok) shopify.toast.show("Order Tracking block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const handleSave = () => {
        const formData = new FormData();
        formData.set("enabled", String(enabled));
        formData.set("config", JSON.stringify(config));
        fetcher.submit(formData, { method: "post" });
        setSaved({ enabled, config });
        shopify.saveBar.hide(SAVE_BAR_ID);
    };

    const handleDiscard = () => {
        setEnabled(saved.enabled);
        setConfig(saved.config);
        shopify.saveBar.hide(SAVE_BAR_ID);
    };

    return (
        <s-section>
            <ui-save-bar id={SAVE_BAR_ID}>
                <button variant="primary" onClick={handleSave}>Save</button>
                <button onClick={handleDiscard}>Discard</button>
            </ui-save-bar>

            <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                <s-heading>Order Tracking Block</s-heading>
                <s-switch label="Enable Order Tracking" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Keep shoppers informed with visual multi-step tracking progress bars directly on their order status page.</s-paragraph>

            <s-stack gap="small" padding="base none">
                <s-text>Display Style</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {DISPLAY_STYLES.map(({ id, title, desc, Icon }) => (
                        <s-clickable
                            key={id}
                            type="button"
                            onClick={() => updateConfig({ displayStyle: id })}
                            border="base"
                            borderRadius="base"
                            padding="base"
                            background={config.displayStyle === id ? "subdued" : "base"}
                        >
                            <Icon size={16} />
                            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "4px" }}>{title}</div>
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>{desc}</div>
                        </s-clickable>
                    ))}
                </div>
            </s-stack>

            <s-select
                label="Default Shipping Carrier"
                value={config.carrier}
                onChange={(e) => updateConfig({ carrier: e.currentTarget.value })}
            >
                {CARRIER_OPTIONS.map((c) => (
                    <s-option key={c} value={c}>{c}</s-option>
                ))}
            </s-select>

            <s-stack gap="small" padding="base none">
                <s-text>Simulate Current Fulfillment Step</s-text>
                <div style={{ display: "flex", gap: "8px" }}>
                    {STEPS.map(({ step, label }) => (
                        <s-button
                            key={step}
                            type="button"
                            variant={config.currentStep === step ? "primary" : "secondary"}
                            onClick={() => updateConfig({ currentStep: step })}
                        >
                            {label}
                        </s-button>
                    ))}
                </div>
            </s-stack>

            <s-text-field
                required
                label="Sample Tracking Number"
                value={config.trackingNumber}
                onChange={(e) => updateConfig({ trackingNumber: e.currentTarget.value })}
            ></s-text-field>
        </s-section>
    );
}