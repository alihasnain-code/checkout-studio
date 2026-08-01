import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const BUTTON_STYLES = [
    { id: "pill", name: "Icon + Text Pills", desc: "Descriptive social buttons" },
    { id: "circular", name: "Icon-Only Circles", desc: "Compact circular icons" },
];

const SAVE_BAR_ID = "social-follow-save-bar";

export default function SocialFollowForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Social block saved");
        else shopify.toast.show(fetcher.data.error || "Failed to save", { isError: true });
    }, [fetcher.state, fetcher.data]);

    const updateConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

    const togglePlatform = (platform) =>
        updateConfig({
            links: config.links.map((link) =>
                link.platform === platform
                    ? { ...link, enabled: !link.enabled, url: link.url || `https://${platform.replace("_", "")}.com/yourbrand` }
                    : link
            ),
        });

    const updateUrl = (platform, newUrl) =>
        updateConfig({
            links: config.links.map((link) => (link.platform === platform ? { ...link, url: newUrl } : link)),
        });

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
                <s-heading>Social Follow Buttons Block</s-heading>
                <s-switch label="Enable Social Follow" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Grow your social media community across Instagram, TikTok, & YouTube right after purchase.</s-paragraph>

            <s-stack gap="small" padding="base none">
                <s-text>Button Visual Style</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {BUTTON_STYLES.map(({ id, name, desc }) => (
                        <div style={{ width: "100%" }} key={id}>
                            <s-clickable
                                type="button"
                                border="base"
                                padding="base"
                                borderRadius="base"
                                background={config.buttonStyle === id ? "subdued" : "base"}
                                onClick={() => updateConfig({ buttonStyle: id })}
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

            <s-stack gap="small" padding="base none">
                <s-text>Select Social Platforms & Enter URLs</s-text>
                {config.links.map((link) => {
                    const platformLabel = link.platform.replace("_", " ").toUpperCase();
                    return (
                        <s-box key={link.platform} padding="small" background="subdued" borderRadius="base">
                            <s-stack gap="small-100">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <s-checkbox
                                        label={platformLabel}
                                        checked={link.enabled}
                                        onChange={() => togglePlatform(link.platform)}
                                    ></s-checkbox>
                                    <s-text color={link.enabled ? undefined : "subdued"}>
                                        {link.enabled ? "Active" : "Disabled"}
                                    </s-text>
                                </s-stack>

                                {link.enabled && (
                                    <s-text-field
                                        label="Profile URL"
                                        labelAccessibilityVisibility="exclusive"
                                        placeholder={`https://${link.platform}.com/yourhandle`}
                                        value={link.url}
                                        onChange={(e) => updateUrl(link.platform, e.currentTarget.value)}
                                    ></s-text-field>
                                )}
                            </s-stack>
                        </s-box>
                    );
                })}
            </s-stack>
        </s-section>
    );
}