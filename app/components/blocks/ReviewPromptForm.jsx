import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Zap, Clock, Star, Link2 } from "lucide-react";

const TIMING_OPTIONS = [
    { id: "immediate", title: "Show Immediately", desc: "On Thank You page after checkout", Icon: Zap },
    { id: "followup", title: "Send Follow-up Email", desc: "Auto-trigger 3 days post delivery", Icon: Clock },
];

const SAVE_BAR_ID = "review-prompt-save-bar";

export default function ReviewPromptForm({ enabled: initialEnabled, config: initialConfig }) {
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
        if (fetcher.data.ok) shopify.toast.show("Review block saved");
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
                <s-heading>Review Prompt Block</s-heading>
                <s-switch label="Enable Review Block" checked={enabled} onChange={() => setEnabled((v) => !v)}></s-switch>
            </s-stack>
            <s-paragraph color="subdued">Collect social proof and ratings on the thank you page while purchase satisfaction is high.</s-paragraph>

            <s-stack gap="small" padding="base none">
                <s-text>Prompt Display Timing</s-text>
                <div style={{ display: "flex", gap: "10px" }}>
                    {TIMING_OPTIONS.map(({ id, title, desc, Icon }) => (
                        <div style={{ width: "100%" }} key={id}>
                            <s-clickable
                                type="button"
                                border="base"
                                padding="base"
                                borderRadius="base"
                                background={config.timing === id ? "subdued" : "base"}
                                onClick={() => updateConfig({ timing: id })}
                            >
                                <s-stack direction="block" gap="small-100">
                                    <Icon size={16} />
                                    <s-text fontWeight="bold">{title}</s-text>
                                    <s-text color="subdued">{desc}</s-text>
                                </s-stack>
                            </s-clickable>
                        </div>
                    ))}
                </div>
            </s-stack>

            <s-box padding="base" background="subdued" borderRadius="base">
                <s-stack gap="small-100">
                    <s-text>Star Rating Interface Style</s-text>
                    <s-stack direction="inline" alignItems="center" gap="small-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={20} fill="currentColor" style={{ color: "#F59E0B" }} />
                        ))}
                        <s-text fontWeight="bold">5-Star Interactive Widget</s-text>
                    </s-stack>
                </s-stack>
            </s-box>

            <s-text-area
                label="Prompt Message Text"
                rows="3"
                value={config.promptText}
                onChange={(e) => updateConfig({ promptText: e.currentTarget.value })}
            ></s-text-area>

            <s-url-field
                required
                label="External Review Platform URL (Judge.me, Trustpilot, Yotpo, etc.)"
                placeholder="https://trustpilot.com/review/yourstore"
                icon={<Link2 size={16} />}
                value={config.reviewUrl}
                onChange={(e) => updateConfig({ reviewUrl: e.currentTarget.value })}
            ></s-url-field>
        </s-section>
    );
}