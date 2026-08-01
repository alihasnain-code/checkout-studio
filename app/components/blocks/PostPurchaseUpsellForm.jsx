import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Percent, Search } from "lucide-react";

const LAYOUT_STYLES = [
    { id: "single", name: "Single Card", desc: "1 hero product" },
    { id: "carousel", name: "Carousel", desc: "Horizontal scroll" },
    { id: "grid", name: "2x2 Grid", desc: "Compact grid" },
];

const SAVE_BAR_ID = "upsell-save-bar";

export default function UpsellForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Upsell block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const openProductPicker = async () => {
        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: true,
            selectionIds: (config.selectedProducts || []).map((p) => ({ id: p.id })),
        });
        if (!selected) return;

        const products = selected.map((p) => ({
            id: p.id,
            title: p.title,
            image: p.images?.[0]?.originalSrc || null,
            price: p.variants?.[0]?.price || null,
        }));
        updateConfig({ selectedProducts: products });
    };

    const removeProduct = (id) =>
        updateConfig({ selectedProducts: config.selectedProducts.filter((p) => p.id !== id) });

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
                <s-heading>Post-Purchase Upsell Block</s-heading>
                <s-switch label="Enable Upsell Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Boost Average Order Value by recommending complementary products right after checkout.</s-paragraph>

            <s-stack gap="small" padding="base none">
                <s-text>Layout Style</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {LAYOUT_STYLES.map(({ id, name, desc }) => (
                        <div style={{ width: "100%" }} key={id}>
                            <s-clickable
                                type="button"
                                border="base"
                                padding="base"
                                borderRadius="base"
                                background={config.layoutStyle === id ? "subdued" : "base"}
                                onClick={() => updateConfig({ layoutStyle: id })}
                            >
                                <s-stack direction="block" gap="small-100">
                                    <s-text fontWeight="bold">{name}</s-text>
                                    <s-text color="subdued">{desc}</s-text>
                                </s-stack>
                            </s-clickable>
                        </div>
                    ))}
                </div>
            </s-stack>

            <s-box padding="base" background="subdued" borderRadius="base">
                <s-stack gap="base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-stack direction="inline" alignItems="center" gap="small-100">
                            <Percent size={16} />
                            <s-text fontWeight="bold">Post-Checkout Discount Incentive</s-text>
                        </s-stack>
                        <s-switch
                            label="Enable Discount"
                            labelAccessibilityVisibility="exclusive"
                            checked={config.enableDiscount}
                            onChange={() => updateConfig({ enableDiscount: !config.enableDiscount })}
                        ></s-switch>
                    </s-stack>

                    {config.enableDiscount && (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ width: "100%" }}>
                                <s-number-field
                                    label="Discount Percentage (%)"
                                    value={String(config.discountPercentage)}
                                    min="1"
                                    max="90"
                                    onChange={(e) => updateConfig({ discountPercentage: Number(e.currentTarget.value) })}
                                ></s-number-field>
                            </div>
                            <div style={{ width: "100%" }}>
                                <s-number-field
                                    label="Urgency Timer (Minutes)"
                                    value={String(config.timerMinutes)}
                                    min="1"
                                    max="60"
                                    onChange={(e) => updateConfig({ timerMinutes: Number(e.currentTarget.value) })}
                                ></s-number-field>
                            </div>
                        </div>
                    )}
                </s-stack>
            </s-box>

            <s-stack gap="small" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Select Featured Products ({(config.selectedProducts || []).length} selected)</s-text>
                    <s-button variant="tertiary" icon="search" type="button" onClick={openProductPicker}>
                        Browse Products
                    </s-button>
                </s-stack>

                {(config.selectedProducts || []).length === 0 && (
                    <s-box padding="base" background="subdued" borderRadius="base">
                        <s-stack direction="block" alignItems="center" gap="small-100">
                            <Search size={16} />
                            <s-text color="subdued">No products selected yet</s-text>
                        </s-stack>
                    </s-box>
                )}

                {(config.selectedProducts || []).map((prod) => (
                    <s-box key={prod.id} padding="small" background="subdued" borderRadius="base">
                        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                            <s-stack direction="inline" alignItems="center" gap="small">
                                <s-thumbnail src={prod.image} alt={prod.title} size="small"></s-thumbnail>
                                <s-stack direction="block" gap="small-100">
                                    <s-text fontWeight="bold">{prod.title}</s-text>
                                    {prod.price && <s-text color="subdued">${prod.price}</s-text>}
                                </s-stack>
                            </s-stack>
                            <s-button variant="tertiary" icon="delete" type="button" onClick={() => removeProduct(prod.id)}></s-button>
                        </s-stack>
                    </s-box>
                ))}
            </s-stack>
        </s-section>
    );
}