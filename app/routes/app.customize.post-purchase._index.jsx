import { useState, useRef, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { BLOCK_REGISTRY } from "../lib/blocks/registry";
import { Truck, MessageCircle, PackageSearch, Gift, ShoppingBag, Star, Share2, RotateCcw, XCircle, ShieldCheck, RefreshCw, Layers, PackageCheck, Repeat, Shield } from "lucide-react";

const ICONS = { Truck, MessageCircle, PackageSearch, Gift, ShoppingBag, Star, Share2, RotateCcw, XCircle, ShieldCheck, RefreshCw, Layers, PackageCheck, Repeat, Shield };

const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY).filter((type) =>
    BLOCK_REGISTRY[type].pages.includes("post-purchase")
);

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);

    const rows = await prisma.appBlock.findMany({
        where: { sessionId: session.id },
        orderBy: { position: "asc" },
    });
    const rowMap = Object.fromEntries(rows.map((r) => [r.blockType, r]));

    const blocks = BLOCK_TYPES
        .map((blockType) => ({
            blockType,
            enabled: rowMap[blockType]?.enabled ?? false,
            position: rowMap[blockType]?.position ?? BLOCK_TYPES.indexOf(blockType),
        }))
        .sort((a, b) => a.position - b.position);

    return { blocks };
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const snapshot = JSON.parse(formData.get("blocksSnapshot") || "[]");
    const valid = snapshot.filter((b) => BLOCK_TYPES.includes(b.blockType));

    try {
        await prisma.$transaction(
            valid.map((b) =>
                prisma.appBlock.update({
                    where: { sessionId_blockType: { sessionId: session.id, blockType: b.blockType } },
                    data: { enabled: b.enabled, position: b.position },
                }),
            ),
        );
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
};

export default function CustomizeThankYou() {
    const { blocks: initialBlocks } = useLoaderData();
    const fetcher = useFetcher();

    const [items, setItems] = useState(initialBlocks);
    const [savedItems, setSavedItems] = useState(initialBlocks);
    const snapshotInputRef = useRef(null);

    useEffect(() => {
        const input = snapshotInputRef.current;
        if (!input) return;
        const value = JSON.stringify(
            items.map(({ blockType, enabled }, index) => ({ blockType, enabled, position: index })),
        );
        if (input.value !== value) {
            input.value = value;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }, [items]);

    useEffect(() => {
        if (fetcher.state !== "idle" || !fetcher.data) return;
        if (fetcher.data.ok) {
            shopify.toast.show("Changes saved");
        } else {
            shopify.toast.show(fetcher.data.error || "Failed to save changes", { isError: true });
        }
    }, [fetcher.state, fetcher.data]);

    const move = (index, dir) => {
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        setItems((prev) => {
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const toggle = (blockType) => {
        setItems((prev) =>
            prev.map((b) => (b.blockType === blockType ? { ...b, enabled: !b.enabled } : b)),
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetcher.submit(new FormData(event.target), { method: "post" });
        setSavedItems(items);
    };

    const handleReset = () => setItems(savedItems);

    const activeCount = items.filter((b) => b.enabled).length;

    return (
        <s-page inlineSize="large" heading="Post Purchase">
            <s-section>
                <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                    <s-heading>Modular Storefront Blocks</s-heading>
                    <s-badge tone="success">{activeCount} Active</s-badge>
                </s-stack>
                <s-paragraph color="subdued">Toggle features on or off, configure settings, and reorder block layout display order.</s-paragraph>

                <form data-save-bar data-discard-confirmation onSubmit={handleSubmit} onReset={handleReset}>
                    <input ref={snapshotInputRef} type="hidden" name="blocksSnapshot" defaultValue={JSON.stringify(initialBlocks)} />

                    <s-stack padding="small none">
                        <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
                            {items.map((item, index) => {
                                const meta = BLOCK_REGISTRY[item.blockType];
                                const Icon = ICONS[meta.icon];
                                return (
                                    <s-box padding="small" background="subdued" borderRadius="base" key={item.blockType}>
                                        <s-stack direction="block" gap="small-100">
                                            <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                                                <s-stack direction="inline" alignItems="center" gap="small-100">
                                                    <s-button icon="chevron-up" variant="tertiary" onClick={() => move(index, -1)}></s-button>
                                                    #{index + 1}
                                                    <s-button icon="chevron-down" variant="tertiary" onClick={() => move(index, 1)}></s-button>
                                                </s-stack>
                                                <s-switch checked={item.enabled} onChange={() => toggle(item.blockType)}></s-switch>
                                            </s-stack>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "start", flexShrink: "none" }}>
                                                <div>
                                                    <s-box padding="small base" background="base" border="base" borderRadius="base">
                                                        <Icon size={16} />
                                                    </s-box>
                                                </div>
                                                <s-stack>
                                                    <s-heading>{meta.heading}</s-heading>
                                                    <p className="line-clamp-2"><s-paragraph>{meta.text}</s-paragraph></p>
                                                </s-stack>
                                            </div>
                                            <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                                                <s-text tone={item.enabled ? "success" : "subdued"}>
                                                    {item.enabled ? "Active on page" : "Disabled"}
                                                </s-text>
                                                <s-button variant="secondary" icon="adjust" href={`/app/customize/post-purchase/${meta.slug}/edit`}>
                                                    Configure
                                                </s-button>
                                            </s-stack>
                                        </s-stack>
                                    </s-box>
                                );
                            })}
                        </s-grid>
                    </s-stack>
                </form>
            </s-section>
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};