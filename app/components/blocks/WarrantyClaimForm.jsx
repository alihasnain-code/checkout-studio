import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "warranty-claim-save-bar";

export default function WarrantyClaimForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Warranty / Repair block saved");
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
                <s-heading>Warranty / Repair Claim</s-heading>
                <s-switch label="Enable Warranty Claim" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Admin Order Action Menu claim registration & photo submission.</s-paragraph>

            <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Warranty Coverage (Days)"
                        value={String(config.warrantyCoverageDays)}
                        min="1"
                        onChange={(e) => updateConfig({ warrantyCoverageDays: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
                <s-checkbox
                    label="Require Serial Number"
                    checked={config.requireSerialNumber}
                    onChange={() => updateConfig({ requireSerialNumber: !config.requireSerialNumber })}
                ></s-checkbox>
            </div>

            <s-text-area
                required
                label="Claim Types Options (Comma Separated)"
                details="These will appear as selectable claim types to your customer during a warranty request."
                rows="3"
                value={config.claimTypes.join(", ")}
                onChange={(e) =>
                    updateConfig({
                        claimTypes: e.currentTarget.value.split(",").map((r) => r.trim()).filter(Boolean),
                    })
                }
            ></s-text-area>
        </s-section>
    );
}