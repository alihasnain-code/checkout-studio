import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "volume-quantity-upsell-save-bar";

export default function VolumeQuantityUpsellForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Volume / Quantity Upsell block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const openProductPicker = async () => {
        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: false,
            selectionIds: config.targetProduct ? [{ id: config.targetProduct.id }] : [],
        });
        if (!selected || !selected[0]) return;

        const p = selected[0];
        updateConfig({
            targetProduct: {
                id: p.id,
                title: p.title,
                image: p.images?.[0]?.originalSrc || null,
                price: p.variants?.[0]?.price || null,
            },
        });
    };

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
                <s-heading>Volume / Quantity Upsell</s-heading>
                <s-switch label="Enable Volume Upsell" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Offer customers an additional unit of a purchased item at an exclusive post-checkout discount.</s-paragraph>

            <s-stack gap="small-100" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Target Upsell Product</s-text>
                    <s-text color="subdued">Featured item on order confirmation</s-text>
                </s-stack>

                {config.targetProduct ? (
                    <s-box padding="small" background="subdued" borderRadius="base">
                        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                            <s-stack direction="inline" alignItems="center" gap="small">
                                <s-thumbnail src={config.targetProduct.image} alt={config.targetProduct.title} size="small"></s-thumbnail>
                                <s-stack direction="block" gap="small-100">
                                    <s-text fontWeight="bold">{config.targetProduct.title}</s-text>
                                    {config.targetProduct.price && <s-text color="subdued">Price: ${config.targetProduct.price}</s-text>}
                                </s-stack>
                            </s-stack>
                            <s-button variant="tertiary" type="button" onClick={openProductPicker}>Change</s-button>
                        </s-stack>
                    </s-box>
                ) : (
                    <s-button variant="secondary" icon="search" type="button" onClick={openProductPicker}>
                        Select Product
                    </s-button>
                )}
            </s-stack>

            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Discount Percentage (%)"
                        value={String(config.discountPercentage)}
                        min="1"
                        max="90"
                        onChange={(e) => updateConfig({ discountPercentage: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Max Quantity Selectable"
                        value={String(config.maxQuantitySelectable)}
                        min="1"
                        max="10"
                        onChange={(e) => updateConfig({ maxQuantitySelectable: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
            </div>

            <s-text-field
                required
                label="Custom Headline Text"
                value={config.customHeadlineText}
                onChange={(e) => updateConfig({ customHeadlineText: e.currentTarget.value })}
            ></s-text-field>

            <s-text-field
                required
                label="Badge Label Text"
                value={config.badgeLabelText}
                onChange={(e) => updateConfig({ badgeLabelText: e.currentTarget.value })}
            ></s-text-field>
        </s-section>
    );
}