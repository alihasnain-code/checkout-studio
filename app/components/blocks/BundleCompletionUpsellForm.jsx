import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const SAVE_BAR_ID = "bundle-completion-upsell-save-bar";

export default function BundleCompletionUpsellForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Bundle Completion Upsell block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const addBundleRule = () =>
        updateConfig({
            bundleRules: [
                ...config.bundleRules,
                { id: crypto.randomUUID(), name: "New Bundle", items: [], discount: 10 },
            ],
        });

    const updateBundleRule = (id, patch) =>
        updateConfig({
            bundleRules: config.bundleRules.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        });

    const removeBundleRule = (id) =>
        updateConfig({ bundleRules: config.bundleRules.filter((b) => b.id !== id) });

    const pickBundleItems = async (bundleId, currentItems) => {
        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: true,
            selectionIds: currentItems.map((p) => ({ id: p.id })),
        });
        if (!selected) return;

        const items = selected.slice(0, 3).map((p) => ({
            id: p.id,
            title: p.title,
            image: p.images?.[0]?.originalSrc || null,
            price: p.variants?.[0]?.price || null,
        }));
        updateBundleRule(bundleId, { items });
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
                <s-heading>Bundle Completion Upsell</s-heading>
                <s-switch label="Enable Bundle Completion" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Detects when a customer owns 2 items from a 3-product bundle and offers the 3rd missing item at a discount.</s-paragraph>

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

            <s-stack gap="small" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Configured 3-Product Bundles ({config.bundleRules.length})</s-text>
                    <s-button variant="tertiary" icon="plus" type="button" onClick={addBundleRule}>Add Bundle Rule</s-button>
                </s-stack>

                {config.bundleRules.map((bundle) => (
                    <s-box key={bundle.id} padding="small" background="subdued" borderRadius="base">
                        <s-stack gap="small">
                            <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
                                <div style={{ width: "100%" }}>
                                    <s-text-field
                                        required
                                        label="Bundle Name"
                                        value={bundle.name}
                                        onChange={(e) => updateBundleRule(bundle.id, { name: e.currentTarget.value })}
                                    ></s-text-field>
                                </div>
                                <div style={{ width: "120px" }}>
                                    <s-number-field
                                        required
                                        label="Discount %"
                                        value={String(bundle.discount)}
                                        min="0"
                                        max="90"
                                        onChange={(e) => updateBundleRule(bundle.id, { discount: Number(e.currentTarget.value) })}
                                    ></s-number-field>
                                </div>
                                <s-button variant="tertiary" icon="delete" type="button" onClick={() => removeBundleRule(bundle.id)}></s-button>
                            </div>

                            <s-stack direction="inline" alignItems="center" gap="small">
                                {bundle.items.map((item) => (
                                    <s-thumbnail key={item.id} src={item.image} alt={item.title} size="small"></s-thumbnail>
                                ))}
                                <s-button
                                    variant="tertiary"
                                    icon="search"
                                    type="button"
                                    onClick={() => pickBundleItems(bundle.id, bundle.items)}
                                >
                                    {bundle.items.length ? "Change Items" : "Select 3 Products"}
                                </s-button>
                            </s-stack>
                        </s-stack>
                    </s-box>
                ))}
            </s-stack>
        </s-section>
    );
}