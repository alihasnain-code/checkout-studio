import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Truck, Package, Calendar, Clock } from "lucide-react";

const ICON_OPTIONS = [
    { id: "truck", label: "Truck", Icon: Truck },
    { id: "package", label: "Package", Icon: Package },
    { id: "calendar", label: "Calendar", Icon: Calendar },
    { id: "clock", label: "Clock", Icon: Clock },
];

const SAVE_BAR_ID = "delivery-estimate-save-bar";

export default function DeliveryEstimateForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Delivery block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const addZone = () =>
        updateConfig({
            zones: [...config.zones, { id: crypto.randomUUID(), zoneName: "New Shipping Zone", minDays: 3, maxDays: 5 }],
        });

    const updateZone = (id, patch) =>
        updateConfig({ zones: config.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) });

    const removeZone = (id) =>
        updateConfig({ zones: config.zones.filter((z) => z.id !== id) });

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
                <s-heading>Delivery Estimate Block</s-heading>
                <s-switch label="Enable Delivery Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Display dynamic estimated delivery ranges based on customer shipping destination.</s-paragraph>

            <s-stack gap="base" padding="base none">
                <s-text>Icon Style</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {ICON_OPTIONS.map(({ id, label, Icon }) => (
                        <div style={{ width: "100%" }} key={id}>
                            <s-clickable
                                type="button"
                                border="base"
                                padding="base"
                                borderRadius="base"
                                background={config.iconStyle === id ? "subdued" : "base"}
                                onClick={() => updateConfig({ iconStyle: id })}
                            >
                                <s-stack direction="block" alignItems="center" gap="small-100">
                                    <Icon size={16} />
                                    <s-text>{label}</s-text>
                                </s-stack>
                            </s-clickable>
                        </div>
                    ))}
                </div>
            </s-stack>

            <s-stack gap="small" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Shipping Zones & Delivery Ranges</s-text>
                    <s-button variant="tertiary" icon="plus" type="button" onClick={addZone}>Add Zone</s-button>
                </s-stack>

                {config.zones.map((zone) => (
                    <s-box key={zone.id} padding="small" background="subdued" borderRadius="base">
                        <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
                            <div style={{ width: "100%" }}>
                                <s-text-field
                                    required
                                    label="Zone Name"
                                    value={zone.zoneName}
                                    onChange={(e) => updateZone(zone.id, { zoneName: e.currentTarget.value })}
                                ></s-text-field>
                            </div>
                            <div style={{ width: "100%" }}>
                                <s-number-field
                                    required
                                    label="Min Days"
                                    value={String(zone.minDays)}
                                    min="1"
                                    onChange={(e) => updateZone(zone.id, { minDays: Number(e.currentTarget.value) })}
                                ></s-number-field>
                            </div>
                            <div style={{ width: "100%" }}>
                                <s-number-field
                                    required
                                    label="Max Days"
                                    value={String(zone.maxDays)}
                                    min="1"
                                    onChange={(e) => updateZone(zone.id, { maxDays: Number(e.currentTarget.value) })}
                                ></s-number-field>
                            </div>
                            <s-button variant="tertiary" icon="delete" type="button" onClick={() => removeZone(zone.id)}></s-button>
                        </div>
                    </s-box>
                ))}
            </s-stack>

            <s-text-field
                label="Fallback Estimate (for unlisted regions)"
                required={config.zones.length === 0}
                value={config.fallbackEstimate}
                onChange={(e) => updateConfig({ fallbackEstimate: e.currentTarget.value })}
            ></s-text-field>
        </s-section>
    );
}