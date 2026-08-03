import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "return-exchange-save-bar";

export default function ReturnExchangeForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Return / Exchange block saved");
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
                <s-heading>Return / Exchange Portal</s-heading>
                <s-switch label="Enable Return / Exchange" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Admin Order Action Menu & Customer self-serve return workflow.</s-paragraph>

            <s-number-field
                required
                label="Max Return Window (Days from fulfillment)"
                value={String(config.maxReturnWindowDays)}
                min="1"
                onChange={(e) => updateConfig({ maxReturnWindowDays: Number(e.currentTarget.value) })}
            ></s-number-field>

            <s-text-area
                required
                label="Allowed Return Reasons (Comma Separated)"
                details="These will appear as selectable reasons to your customer during return request."
                rows="3"
                value={config.allowedReasons.join(", ")}
                onChange={(e) =>
                    updateConfig({
                        allowedReasons: e.currentTarget.value.split(",").map((r) => r.trim()).filter(Boolean),
                    })
                }
            ></s-text-area>

            <div style={{ display: "flex", gap: "20px" }}>
                <s-checkbox
                    label="Allow Item Exchanges"
                    checked={config.allowExchanges}
                    onChange={() => updateConfig({ allowExchanges: !config.allowExchanges })}
                ></s-checkbox>
                <s-checkbox
                    label="Require Photo Proof"
                    checked={config.requirePhotoProof}
                    onChange={() => updateConfig({ requirePhotoProof: !config.requirePhotoProof })}
                ></s-checkbox>
            </div>
        </s-section>
    );
}