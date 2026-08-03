import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "warranty-device-protection-save-bar";

export default function WarrantyDeviceProtectionForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Warranty & Device Protection block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const openCollectionPicker = async () => {
        const selected = await shopify.resourcePicker({
            type: "collection",
            multiple: true,
            selectionIds: (config.qualifyingCollections || []).map((c) => ({ id: c.id })),
        });
        if (!selected) return;

        const collections = selected.map((c) => ({ id: c.id, title: c.title }));
        updateConfig({ qualifyingCollections: collections });
    };

    const removeCollection = (id) =>
        updateConfig({ qualifyingCollections: config.qualifyingCollections.filter((c) => c.id !== id) });

    const openWarrantyProductPicker = async () => {
        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: false,
            selectionIds: config.warrantyProduct ? [{ id: config.warrantyProduct.id }] : [],
        });
        if (!selected || !selected[0]) return;

        const p = selected[0];
        updateConfig({
            warrantyProduct: {
                id: p.id,
                title: p.title,
                image: p.images?.[0]?.originalSrc || null,
                price: p.variants?.[0]?.price || null,
                sku: p.variants?.[0]?.sku || "",
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
                <s-heading>Warranty & Device Protection</s-heading>
                <s-switch label="Enable Warranty Protection" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Offer buyers extended warranty or accidental damage protection plans based on qualifying product collections.</s-paragraph>

            <s-stack gap="small-100" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Qualifying Collections</s-text>
                    <s-button variant="tertiary" icon="plus" type="button" onClick={openCollectionPicker}>
                        Select Collections
                    </s-button>
                </s-stack>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(config.qualifyingCollections || []).map((col) => (
                        <s-box key={col.id} padding="small-100" background="subdued" borderRadius="base">
                            <s-stack direction="inline" alignItems="center" gap="small-100">
                                <s-text>{col.title}</s-text>
                                <s-button variant="tertiary" icon="x" type="button" onClick={() => removeCollection(col.id)}></s-button>
                            </s-stack>
                        </s-box>
                    ))}
                </div>
            </s-stack>

            <s-stack gap="small-100" padding="base none">
                <s-text>Warranty Product Item in Shopify</s-text>
                {config.warrantyProduct ? (
                    <s-box padding="small" background="subdued" borderRadius="base">
                        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                            <s-stack direction="inline" alignItems="center" gap="small">
                                <s-thumbnail src={config.warrantyProduct.image} alt={config.warrantyProduct.title} size="small"></s-thumbnail>
                                <s-stack direction="block" gap="small-100">
                                    <s-text fontWeight="bold">{config.warrantyProduct.title}</s-text>
                                    {config.warrantyProduct.sku && <s-text color="subdued">SKU: {config.warrantyProduct.sku}</s-text>}
                                </s-stack>
                            </s-stack>
                            <s-button variant="tertiary" type="button" onClick={openWarrantyProductPicker}>Change</s-button>
                        </s-stack>
                    </s-box>
                ) : (
                    <s-button variant="secondary" icon="search" type="button" onClick={openWarrantyProductPicker}>
                        Select Warranty Product
                    </s-button>
                )}
            </s-stack>

            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Warranty Price ($)"
                        value={String(config.warrantyPrice)}
                        min="0"
                        step="0.01"
                        onChange={(e) => updateConfig({ warrantyPrice: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Coverage Duration (Months)"
                        value={String(config.coverageDurationMonths)}
                        min="1"
                        onChange={(e) => updateConfig({ coverageDurationMonths: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "100%" }}>
                    <s-text-field
                        required
                        label="Offer Headline Text"
                        value={config.offerHeadlineText}
                        onChange={(e) => updateConfig({ offerHeadlineText: e.currentTarget.value })}
                    ></s-text-field>
                </div>
                <div style={{ width: "100%" }}>
                    <s-text-field
                        required
                        label="Badge Text"
                        value={config.badgeText}
                        onChange={(e) => updateConfig({ badgeText: e.currentTarget.value })}
                    ></s-text-field>
                </div>
            </div>
        </s-section>
    );
}