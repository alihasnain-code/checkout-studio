import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const DESTINATION_OPTIONS = [
    { value: "draft_order_admin", label: "Shopify Draft Order (Admin)" },
    { value: "storefront_cart", label: "Customer Storefront Cart" },
    { value: "checkout_direct", label: "Direct to Checkout" },
];

const SAVE_BAR_ID = "reorder-button-save-bar";

export default function ReorderButtonForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Reorder Quick Action block saved");
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
                <s-heading>Reorder Quick Action</s-heading>
                <s-switch label="Enable Reorder Action" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Admin Order Action & Customer re-add items to cart or draft order.</s-paragraph>

            <s-text-field
                required
                label="Reorder Button Label"
                value={config.buttonLabel}
                onChange={(e) => updateConfig({ buttonLabel: e.currentTarget.value })}
            ></s-text-field>

            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "100%" }}>
                    <s-select
                        label="Destination Target"
                        value={config.destinationTarget}
                        onChange={(e) => updateConfig({ destinationTarget: e.currentTarget.value })}
                    >
                        {DESTINATION_OPTIONS.map(({ value, label }) => (
                            <s-option key={value} value={value}>{label}</s-option>
                        ))}
                    </s-select>
                </div>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Reorder Incentive Discount %"
                        value={String(config.reorderIncentiveDiscount)}
                        min="0"
                        max="90"
                        onChange={(e) => updateConfig({ reorderIncentiveDiscount: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
            </div>
        </s-section>
    );
}