import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const FREQUENCY_OPTIONS = ["30 Days", "60 Days", "90 Days"];
const SAVE_BAR_ID = "subscribe-and-save-save-bar";

export default function SubscribeAndSaveForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Subscribe & Save block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const toggleFrequency = (freq) =>
        updateConfig({
            allowedDeliveryFrequencies: config.allowedDeliveryFrequencies.includes(freq)
                ? config.allowedDeliveryFrequencies.filter((f) => f !== freq)
                : [...config.allowedDeliveryFrequencies, freq],
        });

    const openProductPicker = async () => {
        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: true,
            selectionIds: (config.subscriptionEligibleProducts || []).map((p) => ({ id: p.id })),
        });
        if (!selected) return;

        const products = selected.map((p) => ({
            id: p.id,
            title: p.title,
            image: p.images?.[0]?.originalSrc || null,
            price: p.variants?.[0]?.price || null,
        }));
        updateConfig({ subscriptionEligibleProducts: products });
    };

    const removeProduct = (id) =>
        updateConfig({ subscriptionEligibleProducts: config.subscriptionEligibleProducts.filter((p) => p.id !== id) });

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
                <s-heading>Subscribe & Save Post-Purchase</s-heading>
                <s-switch label="Enable Subscribe & Save" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Convert one-time buyers into recurring subscribers right after they complete their purchase.</s-paragraph>

            <s-banner tone="warning">
                <s-text fontWeight="bold">Requires selling plans configured on selected products:</s-text>{" "}
                <s-text>
                    Ensure your Shopify store has active Subscription Selling Plans linked to these items in your admin settings.
                </s-text>
                <div>
                    <s-checkbox
                        label="Mark Selling Plans as Active & Configured"
                        checked={config.markSellingPlansActiveAndConfigured}
                        onChange={() => updateConfig({ markSellingPlansActiveAndConfigured: !config.markSellingPlansActiveAndConfigured })}
                    ></s-checkbox>
                </div>
            </s-banner>

            <s-stack gap="small" padding="base none">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>Subscription-Eligible Products ({(config.subscriptionEligibleProducts || []).length} selected)</s-text>
                    <s-button variant="tertiary" icon="search" type="button" onClick={openProductPicker}>
                        Select Products
                    </s-button>
                </s-stack>

                {(config.subscriptionEligibleProducts || []).map((prod) => (
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

            <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "100%" }}>
                    <s-number-field
                        required
                        label="Subscription Recurring Discount (%)"
                        value={String(config.subscriptionRecurringDiscount)}
                        min="0"
                        max="50"
                        onChange={(e) => updateConfig({ subscriptionRecurringDiscount: Number(e.currentTarget.value) })}
                    ></s-number-field>
                </div>
            </div>

            <s-stack gap="small-100" padding="base none">
                <s-text>Allowed Delivery Frequencies</s-text>
                <div style={{ display: "flex", gap: "8px" }}>
                    {FREQUENCY_OPTIONS.map((freq) => (
                        <s-button
                            key={freq}
                            type="button"
                            variant={config.allowedDeliveryFrequencies.includes(freq) ? "primary" : "secondary"}
                            onClick={() => toggleFrequency(freq)}
                        >
                            {freq}
                        </s-button>
                    ))}
                </div>
            </s-stack>

            <s-text-field
                required
                label="Offer Headline Text"
                value={config.offerHeadlineText}
                onChange={(e) => updateConfig({ offerHeadlineText: e.currentTarget.value })}
            ></s-text-field>
        </s-section>
    );
}