export const BLOCK_REGISTRY = {
    DELIVERY_ESTIMATE: {
        slug: "delivery-estimate",
        heading: "Delivery Estimate",
        text: "Display transparent estimated delivery dates based on customer location.",
        icon: "Truck",
        pages: ["thank-you", "orders"],
        defaultConfig: { iconStyle: "truck", zones: [], fallbackEstimate: "" }
    },
    WHATSAPP_CONFIRMATION: {
        slug: "whatsapp-confirmation",
        heading: "WhatsApp Confirmation",
        text: "Let customers get instant order updates & support directly on WhatsApp.",
        icon: "MessageCircle",
        pages: ["thank-you"],
        defaultConfig: { phoneNumber: "", messageTemplate: "Hi {customer_name}! Thanks for order #{order_number}. Total: {total_price}. Please confirm my order details.", buttonLabel: "Chat on WhatsApp", buttonColor: "#25D366" }
    },
    ORDER_TRACKING: {
        slug: "order-tracking",
        heading: "Order Tracking",
        text: "Show live visual tracking steps from order placed to final delivery.",
        icon: "PackageSearch",
        pages: ["orders"],
        defaultConfig: { displayStyle: "progressbar", carrier: "Shopify Logistics / DHL", currentStep: 1, trackingNumber: "" }
    },
    POST_PURCHASE_UPSELL: {
        slug: "post-purchase-upsell",
        heading: "Post-Purchase Upsell",
        text: "Boost Average Order Value with 1-click post-purchase recommendations.",
        icon: "ShoppingBag",
        pages: ["post-purchase"],
        defaultConfig: { layoutStyle: "single", enableDiscount: false, discountPercentage: 10, timerMinutes: 10, selectedProductIds: [] }
    },
    REFERRAL_DISCOUNT: {
        slug: "referral-discount",
        heading: "Referral Discount Code",
        text: "Reward customers with an instant discount code for their next purchase or friends.",
        icon: "Gift",
        pages: ["thank-you", "orders"],
        defaultConfig: { discountType: "percentage", discountValue: 10, expiryDays: 7, codePrefix: "THANKS-", messageTemplate: "" }
    },
    REVIEW_PROMPT: {
        slug: "review-prompt",
        heading: "Review Prompt",
        text: "Collect social proof & store reviews while purchase satisfaction is high.",
        icon: "Star",
        pages: ["thank-you", "orders"],
        defaultConfig: { timing: "immediate", promptText: "", reviewUrl: "" }
    },
    SOCIAL_FOLLOW: {
        slug: "social-follow",
        heading: "Social Follow Buttons",
        text: "Grow your social media community across Instagram, TikTok & YouTube.",
        icon: "Share2",
        pages: ["thank-you"],
        defaultConfig: { buttonStyle: "pill", links: [] }
    },
    RETURN_EXCHANGE: {
        slug: "return-exchange",
        heading: "Return / Exchange Portal",
        text: "Admin Order Action Menu & Customer self-serve return workflow.",
        icon: "RotateCcw",
        pages: ["orders"],
        defaultConfig: {
            maxReturnWindowDays: 30,
            allowedReasons: ["Wrong Size/Fit", "Defective or Damaged", "Item Not as Pictured", "Changed Mind", "Received Wrong Item"],
            allowExchanges: true,
            requirePhotoProof: true,
        },
    },
    CANCEL_MODIFY: {
        slug: "cancel-modify",
        heading: "Cancel / Modify Order Request",
        text: "Admin Order Action Menu & Pre-fulfillment cancellation check.",
        icon: "XCircle",
        pages: ["orders"],
        defaultConfig: {
            maxHoursAfterPlacement: 24,
            cancellationReasons: ["Ordered by mistake", "Found better price elsewhere", "Need to change shipping address", "Duplicate order"],
        },
    },
    WARRANTY_CLAIM: {
        slug: "warranty-claim",
        heading: "Warranty / Repair Claim",
        text: "Admin Order Action Menu claim registration & photo submission.",
        icon: "ShieldCheck",
        pages: ["orders"],
        defaultConfig: {
            warrantyCoverageDays: 365,
            requireSerialNumber: true,
            claimTypes: ["Hardware Malfunction", "Physical Damage", "Missing Component", "Performance Degradation"],
        },
    },
    REORDER_BUTTON: {
        slug: "reorder-button",
        heading: "Reorder Quick Action",
        text: "Admin Order Action & Customer re-add items to cart or draft order.",
        icon: "RefreshCw",
        pages: ["orders"],
        defaultConfig: {
            buttonLabel: "Reorder Previous Items",
            destinationTarget: "draft_order_admin",
            reorderIncentiveDiscount: 10,
        },
    },
    VOLUME_QUANTITY_UPSELL: {
        slug: "volume-quantity-upsell",
        heading: "Volume / Quantity Upsell",
        text: "Offer customers an additional unit of a purchased item at an exclusive post-checkout discount.",
        icon: "Layers",
        pages: ["post-purchase"],
        defaultConfig: {
            targetProduct: null, // { id, title, image, price }
            discountPercentage: 25,
            maxQuantitySelectable: 2,
            customHeadlineText: "Add another pair for a friend & save big!",
            badgeLabelText: "LIMITED POST-PURCHASE OFFER",
        },
    },
    GIFT_WRAPPING: {
        slug: "gift-wrapping",
        heading: "Gift Wrapping & Gift Message",
        text: "Allow post-purchase buyers to add custom gift wrapping and a personalized note directly to their order.",
        icon: "Gift",
        pages: ["post-purchase"],
        defaultConfig: {
            enableGiftWrapOption: true,
            giftWrapPrice: 5.99,
            optionTitle: "Premium Eco Satin Gift Box & Ribbon",
            enableGiftMessageCard: true,
            messageCharacterLimit: 200,
            offerHeadlineText: "Sending a gift? Add luxury gift wrapping & message",
        },
    },
    BUNDLE_COMPLETION_UPSELL: {
        slug: "bundle-completion-upsell",
        heading: "Bundle Completion Upsell",
        text: "Detects when a customer owns 2 items from a 3-product bundle and offers the 3rd missing item at a discount.",
        icon: "PackageCheck",
        pages: ["post-purchase"],
        defaultConfig: {
            offerHeadlineText: "Complete your bundle & get an instant discount!",
            badgeText: "1 ITEM AWAY FROM BUNDLE SAVINGS",
            bundleRules: [], // [{ id, name, items: [{id,title,image,price}], discount }]
        },
    },
    SUBSCRIBE_AND_SAVE: {
        slug: "subscribe-and-save",
        heading: "Subscribe & Save Post-Purchase",
        text: "Convert one-time buyers into recurring subscribers right after they complete their purchase.",
        icon: "Repeat",
        pages: ["post-purchase"],
        defaultConfig: {
            requiresSellingPlans: true,
            markSellingPlansActiveAndConfigured: true,
            subscriptionEligibleProducts: [], // [{id,title,image,price}]
            subscriptionRecurringDiscount: 15,
            allowedDeliveryFrequencies: ["30 Days", "60 Days", "90 Days"],
            offerHeadlineText: "Never run out! Switch to auto-delivery & save 15%",
        },
    },
    WARRANTY_DEVICE_PROTECTION: {
        slug: "warranty-device-protection",
        heading: "Warranty & Device Protection",
        text: "Offer buyers extended warranty or accidental damage protection plans based on qualifying product collections.",
        icon: "Shield",
        pages: ["post-purchase"],
        defaultConfig: {
            qualifyingCollections: [], // [{id, title}]
            warrantyProduct: null, // { id, title, image, price, sku }
            warrantyPrice: 24,
            coverageDurationMonths: 24,
            offerHeadlineText: "Protect your new device against drops & liquid damage",
            badgeText: "ACCI-SHIELD COVERAGE",
        },
    },
};

export const SLUG_TO_TYPE = Object.fromEntries(
    Object.entries(BLOCK_REGISTRY).map(([type, meta]) => [meta.slug, type])
);