export const BLOCK_REGISTRY = {
    DELIVERY_ESTIMATE: { slug: "delivery-estimate", heading: "Delivery Estimate", text: "Display transparent estimated delivery dates based on customer location.", icon: "Truck", defaultConfig: { iconStyle: "truck", zones: [], fallbackEstimate: "" } },
    WHATSAPP_CONFIRMATION: { slug: "whatsapp-confirmation", heading: "WhatsApp Confirmation", text: "Let customers get instant order updates & support directly on WhatsApp.", icon: "MessageCircle", defaultConfig: { phoneNumber: "", messageTemplate: "", buttonLabel: "Chat on WhatsApp", buttonColor: "#25D366" } },
    ORDER_TRACKING: { slug: "order-tracking", heading: "Order Tracking", text: "Show live visual tracking steps from order placed to final delivery.", icon: "PackageSearch", defaultConfig: { displayStyle: "progressbar", carrier: "Shopify Logistics / DHL", currentStep: 1, trackingNumber: "" } },
    POST_PURCHASE_UPSELL: { slug: "post-purchase-upsell", heading: "Post-Purchase Upsell", text: "Boost Average Order Value with 1-click post-purchase recommendations.", icon: "ShoppingBag", defaultConfig: { layoutStyle: "single", enableDiscount: false, discountPercentage: 10, timerMinutes: 10, selectedProductIds: [] } },
    REFERRAL_DISCOUNT: { slug: "referral-discount", heading: "Referral Discount Code", text: "Reward customers with an instant discount code for their next purchase or friends.", icon: "Gift", defaultConfig: { discountType: "percentage", discountValue: 10, expiryDays: 7, codePrefix: "THANKS-", messageTemplate: "" } },
    REVIEW_PROMPT: { slug: "review-prompt", heading: "Review Prompt", text: "Collect social proof & store reviews while purchase satisfaction is high.", icon: "Star", defaultConfig: { timing: "immediate", promptText: "", reviewUrl: "" } },
    SOCIAL_FOLLOW: { slug: "social-follow", heading: "Social Follow Buttons", text: "Grow your social media community across Instagram, TikTok & YouTube.", icon: "Share2", defaultConfig: { buttonStyle: "pill", links: [] } },
};

export const SLUG_TO_TYPE = Object.fromEntries(
    Object.entries(BLOCK_REGISTRY).map(([type, meta]) => [meta.slug, type])
);