import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "cancel-modify-save-bar";

export default function CancelModifyForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Cancel / Modify block saved");
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
                <s-heading>Cancel / Modify Order Request</s-heading>
                <s-switch label="Enable Cancel / Modify" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Admin Order Action Menu & Pre-fulfillment cancellation check.</s-paragraph>

            <s-number-field
                required
                label="Max Hours Allowed After Order Placement"
                value={String(config.maxHoursAfterPlacement)}
                min="1"
                onChange={(e) => updateConfig({ maxHoursAfterPlacement: Number(e.currentTarget.value) })}
            ></s-number-field>

            <s-banner tone="warning">
                <s-text fontWeight="bold">Unfulfilled Order Constraint:</s-text>{" "}
                <s-text>
                    Order cancellations & line-item edits are mathematically restricted to unfulfilled orders. Once shipped, the extension automatically redirects requests to the Return & Exchange portal.
                </s-text>
            </s-banner>

            <s-text-area
                required
                label="Cancellation Reasons (Comma Separated)"
                details="These will appear as selectable reasons to your customer during a cancellation request."
                rows="3"
                value={config.cancellationReasons.join(", ")}
                onChange={(e) =>
                    updateConfig({
                        cancellationReasons: e.currentTarget.value.split(",").map((r) => r.trim()).filter(Boolean),
                    })
                }
            ></s-text-area>
        </s-section>
    );
}