import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import prisma from "../db.server";
import { BLOCK_REGISTRY, SLUG_TO_TYPE } from "../lib/blocks/registry";
import PostPurchaseUpsellForm from "../components/blocks/PostPurchaseUpsellForm";
import VolumeQuantityUpsellForm from "../components/blocks/VolumeQuantityUpsellForm";
import GiftWrappingForm from "../components/blocks/GiftWrappingForm";
import BundleCompletionUpsellForm from "../components/blocks/BundleCompletionUpsellForm";
import SubscribeAndSaveForm from "../components/blocks/SubscribeAndSaveForm";
import WarrantyDeviceProtectionForm from "../components/blocks/WarrantyDeviceProtectionForm";

const CONFIG_FORMS = {
    POST_PURCHASE_UPSELL: PostPurchaseUpsellForm,
    VOLUME_QUANTITY_UPSELL: VolumeQuantityUpsellForm,
    GIFT_WRAPPING: GiftWrappingForm,
    BUNDLE_COMPLETION_UPSELL: BundleCompletionUpsellForm,
    SUBSCRIBE_AND_SAVE: SubscribeAndSaveForm,
    WARRANTY_DEVICE_PROTECTION: WarrantyDeviceProtectionForm,
};

export const loader = async ({ request, params }) => {
    const { session } = await authenticate.admin(request);
    const blockType = SLUG_TO_TYPE[params.slug];
    if (!blockType) throw new Response("Not found", { status: 404 });

    const row = await prisma.appBlock.findUnique({
        where: { sessionId_blockType: { sessionId: session.id, blockType } },
    });

    return {
        blockType,
        enabled: row?.enabled ?? false,
        config: row?.config ?? BLOCK_REGISTRY[blockType].defaultConfig,
    };
};

export default function CustomizeThankYouBlock() {
    const { blockType, enabled, config } = useLoaderData();
    const meta = BLOCK_REGISTRY[blockType];
    const Form = CONFIG_FORMS[blockType];

    return (
        <s-page heading={meta.heading}>
            <s-link slot="breadcrumb-actions" href="/app/customize/post-purchase">
                Post Purchase
            </s-link>
            <Form enabled={enabled} config={config} />
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};