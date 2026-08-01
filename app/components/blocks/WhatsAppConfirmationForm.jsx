import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const COLOR_SWATCHES = ["#25D366", "#075E54", "#2563EB", "#10B981", "#8B5CF6", "#000000"];
const DYNAMIC_CHIPS = ["{customer_name}", "{order_number}", "{total_price}", "{shipping_address}"];
const SAVE_BAR_ID = "whatsapp-confirmation-save-bar";

export default function WhatsAppConfirmationForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("WhatsApp block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const insertVariable = (chip) =>
        updateConfig({ messageTemplate: `${config.messageTemplate} ${chip}` });

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
                <s-heading>WhatsApp Order Confirmation</s-heading>
                <s-switch label="Enable WhatsApp Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Let shoppers receive instant order updates and chat directly on WhatsApp post-checkout.</s-paragraph>

            <s-text-field
                required
                label="Merchant WhatsApp Phone Number"
                placeholder="+1 (555) 000-0000"
                details="Include country code (e.g. +1 for US/Canada, +44 for UK)."
                value={config.phoneNumber}
                onChange={(e) => updateConfig({ phoneNumber: e.currentTarget.value })}
            ></s-text-field>

            <s-stack gap="small-100" padding="base none">
                <s-text>Pre-filled Message Template</s-text>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DYNAMIC_CHIPS.map((chip) => (
                        <s-button key={chip} type="button" variant="tertiary" onClick={() => insertVariable(chip)}>
                            + {chip}
                        </s-button>
                    ))}
                </div>
                <s-text-area
                    required
                    label="Message"
                    labelAccessibilityVisibility="exclusive"
                    rows="4"
                    value={config.messageTemplate}
                    onChange={(e) => updateConfig({ messageTemplate: e.currentTarget.value })}
                ></s-text-area>
            </s-stack>

            <s-text-field
                required
                label="Button Label Text"
                value={config.buttonLabel}
                onChange={(e) => updateConfig({ buttonLabel: e.currentTarget.value })}
            ></s-text-field>

            <s-stack gap="small-100" padding="base none">
                <s-text>Button Color Swatch</s-text>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {COLOR_SWATCHES.map((hex) => (
                        <button
                            key={hex}
                            type="button"
                            onClick={() => updateConfig({ buttonColor: hex })}
                            style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "9999px",
                                backgroundColor: hex,
                                border: config.buttonColor === hex ? "2px solid var(--s-color-border-emphasis)" : "2px solid transparent",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        ></button>
                    ))}
                </div>
                <div>
                    <s-color-field
                        label="Custom color"
                        labelAccessibilityVisibility="exclusive"
                        value={config.buttonColor}
                        onChange={(e) => updateConfig({ buttonColor: e.currentTarget.value })}
                    ></s-color-field>
                </div>
            </s-stack>
        </s-section>
    );
}