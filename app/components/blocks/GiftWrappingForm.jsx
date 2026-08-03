import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "gift-wrapping-save-bar";

export default function GiftWrappingForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Gift Wrapping & Gift Message block saved");
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
                <s-heading>Gift Wrapping & Gift Message</s-heading>
                <s-switch label="Enable Gift Wrapping Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Allow post-purchase buyers to add custom gift wrapping and a personalized note directly to their order.</s-paragraph>

            <s-box padding="base" background="subdued" borderRadius="base">
                <s-stack gap="base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-text fontWeight="bold">Enable Gift Wrap Option</s-text>
                        <s-switch
                            label="Enable Gift Wrap Option"
                            labelAccessibilityVisibility="exclusive"
                            checked={config.enableGiftWrapOption}
                            onChange={() => updateConfig({ enableGiftWrapOption: !config.enableGiftWrapOption })}
                        ></s-switch>
                    </s-stack>

                    {config.enableGiftWrapOption && (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ width: "100%" }}>
                                <s-number-field
                                    required
                                    label="Gift Wrap Price ($)"
                                    value={String(config.giftWrapPrice)}
                                    min="0"
                                    step="0.01"
                                    onChange={(e) => updateConfig({ giftWrapPrice: Number(e.currentTarget.value) })}
                                ></s-number-field>
                            </div>
                            <div style={{ width: "100%" }}>
                                <s-text-field
                                    required
                                    label="Option Title"
                                    value={config.optionTitle}
                                    onChange={(e) => updateConfig({ optionTitle: e.currentTarget.value })}
                                ></s-text-field>
                            </div>
                        </div>
                    )}
                </s-stack>
            </s-box>

            <s-box padding="base" background="subdued" borderRadius="base">
                <s-stack gap="base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-text fontWeight="bold">Enable Gift Message Card Field</s-text>
                        <s-switch
                            label="Enable Gift Message Card Field"
                            labelAccessibilityVisibility="exclusive"
                            checked={config.enableGiftMessageCard}
                            onChange={() => updateConfig({ enableGiftMessageCard: !config.enableGiftMessageCard })}
                        ></s-switch>
                    </s-stack>

                    {config.enableGiftMessageCard && (
                        <s-number-field
                            required
                            label="Message Character Limit"
                            value={String(config.messageCharacterLimit)}
                            min="20"
                            max="1000"
                            onChange={(e) => updateConfig({ messageCharacterLimit: Number(e.currentTarget.value) })}
                        ></s-number-field>
                    )}
                </s-stack>
            </s-box>

            <s-text-field
                required
                label="Offer Headline Text"
                value={config.offerHeadlineText}
                onChange={(e) => updateConfig({ offerHeadlineText: e.currentTarget.value })}
            ></s-text-field>
        </s-section>
    );
}