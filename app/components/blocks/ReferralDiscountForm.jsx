import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Percent, DollarSign, Truck } from "lucide-react";

const DISCOUNT_TYPES = [
    { id: "percentage", label: "Percentage Off", Icon: Percent },
    { id: "fixed", label: "Fixed Amount Off", Icon: DollarSign },
    { id: "shipping", label: "Free Shipping", Icon: Truck },
];

const EXPIRY_OPTIONS = [
    { value: 7, label: "7 Days after order" },
    { value: 14, label: "14 Days after order" },
    { value: 30, label: "30 Days after order" },
    { value: 0, label: "No Expiry (Lifetime)" },
];

const SAVE_BAR_ID = "referral-discount-save-bar";

export default function ReferralDiscountForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Referral block saved");
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
                <s-heading>Referral / Discount Code Block</s-heading>
                <s-switch label="Enable Discount Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Reward recent buyers with a discount code for their next purchase or friend referral.</s-paragraph>

            <s-stack gap="small" padding="base none">
                <s-text>Discount Type</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {DISCOUNT_TYPES.map(({ id, label, Icon }) => (
                        <div style={{ width: "100%" }} key={id}>
                            <s-clickable
                                type="button"
                                border="base"
                                padding="base"
                                borderRadius="base"
                                background={config.discountType === id ? "subdued" : "base"}
                                onClick={() => updateConfig({ discountType: id })}
                            >
                                <s-stack direction="block" alignItems="center" gap="small-100">
                                    <Icon size={16} />
                                    <s-text>{label}</s-text>
                                </s-stack>
                            </s-clickable>
                        </div>
                    ))}
                </div>
            </s-stack>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                {config.discountType !== "shipping" && (
                    <s-number-field
                        required
                        label={`Discount Value (${config.discountType === "percentage" ? "%" : "$"})`}
                        value={String(config.discountValue)}
                        min="1"
                        max="500"
                        onChange={(e) => updateConfig({ discountValue: Number(e.currentTarget.value) })}
                    ></s-number-field>
                )}

                <s-select
                    label="Code Expiry Duration"
                    value={String(config.expiryDays)}
                    onChange={(e) => updateConfig({ expiryDays: Number(e.currentTarget.value) })}
                >
                    {EXPIRY_OPTIONS.map(({ value, label }) => (
                        <s-option key={value} value={String(value)}>{label}</s-option>
                    ))}
                </s-select>

                <s-text-field
                    label="Discount Code Prefix"
                    placeholder="THANKS-"
                    // details="Random 4-character suffix will be appended automatically for uniqueness."
                    value={config.codePrefix}
                    onChange={(e) => updateConfig({ codePrefix: e.currentTarget.value })}
                ></s-text-field>
            </div>
            <s-text-area
                label="Message Sub-Text"
                rows="3"
                value={config.messageTemplate}
                onChange={(e) => updateConfig({ messageTemplate: e.currentTarget.value })}
            ></s-text-area>
        </s-section>
    );
}