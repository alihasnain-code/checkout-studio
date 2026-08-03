import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import prisma from "../db.server";
import { BLOCK_REGISTRY, SLUG_TO_TYPE } from "../lib/blocks/registry";
import DeliveryEstimateForm from "../components/blocks/DeliveryEstimateForm";
import WhatsAppConfirmationForm from "../components/blocks/WhatsAppConfirmationForm";
import ReferralDiscountForm from "../components/blocks/ReferralDiscountForm";
import ReviewPromptForm from "../components/blocks/ReviewPromptForm";
import SocialFollowForm from "../components/blocks/SocialFollowForm";

const CONFIG_FORMS = {
    DELIVERY_ESTIMATE: DeliveryEstimateForm,
    WHATSAPP_CONFIRMATION: WhatsAppConfirmationForm,
    REFERRAL_DISCOUNT: ReferralDiscountForm,
    REVIEW_PROMPT: ReviewPromptForm,
    SOCIAL_FOLLOW: SocialFollowForm,
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
            <s-link slot="breadcrumb-actions" href="/app/customize/thank-you">
                Thank You
            </s-link>
            <Form enabled={enabled} config={config} />
        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};