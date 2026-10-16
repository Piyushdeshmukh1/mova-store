/**
 * Field schemas drive the Admin form builder. Adding a field here makes it
 * editable in Admin automatically — no new form code required.
 */
export type FieldType = "text" | "textarea" | "image" | "url" | "number" | "toggle" | "select" | "list" | "color" | "date" | "markdown";
export type Field = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: { label: string; value: string }[];
  fields?: Field[]; // for list items
  itemLabel?: string;
  required?: boolean;
  placeholder?: string;
  half?: boolean; // render at half width in forms
};

const link = (prefix: string, label: string): Field[] => [
  { key: `${prefix}Label`, label: `${label} text`, type: "text" },
  { key: `${prefix}Url`, label: `${label} link`, type: "url" },
];

export const ICON_OPTIONS = [
  "feather", "droplets", "backpack", "shield", "sparkles", "wind", "leaf", "heart", "zap", "sun", "timer", "waves",
].map((v) => ({ label: v, value: v }));

export const PRODUCT_SOURCE_OPTIONS = [
  { label: "Featured products", value: "featured" },
  { label: "Bestsellers", value: "bestseller" },
  { label: "New arrivals", value: "new" },
  { label: "Gym towels category", value: "cat:gym-towels" },
  { label: "Handkerchiefs category", value: "cat:handkerchiefs" },
  { label: "Combo packs category", value: "cat:combo-packs" },
];

export const SECTION_TYPES: Record<string, { name: string; description: string; fields: Field[] }> = {
  hero: {
    name: "Hero banner",
    description: "The first screen visitors see.",
    fields: [
      { key: "eyebrow", label: "Small line above heading (optional)", type: "text" },
      { key: "heading", label: "Heading", type: "textarea", help: "Each new line becomes a new line on the page." },
      { key: "subheading", label: "Subheading", type: "textarea" },
      ...link("primary", "Primary button"),
      ...link("secondary", "Secondary button"),
      { key: "image", label: "Main image", type: "image" },
      { key: "secondaryImage", label: "Floating small image", type: "image" },
      { key: "badgeText", label: "Round badge text", type: "text" },
      { key: "highlights", label: "Highlights under buttons", type: "list", itemLabel: "Highlight", fields: [{ key: "text", label: "Text", type: "text" }] },
    ],
  },
  marquee: {
    name: "Scrolling ticker",
    description: "A moving strip of short phrases.",
    fields: [
      { key: "theme", label: "Colour", type: "select", options: [{ label: "Mint", value: "mint" }, { label: "Forest", value: "forest" }, { label: "Coral", value: "coral" }] },
      { key: "items", label: "Phrases", type: "list", itemLabel: "Phrase", fields: [{ key: "text", label: "Text", type: "text" }] },
    ],
  },
  moments: {
    name: "Shop by moment",
    description: "Visual cards linking to collections.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "cards", label: "Cards", type: "list", itemLabel: "Card", fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "text" },
        { key: "image", label: "Image", type: "image" },
        { key: "url", label: "Link", type: "url" },
      ] },
    ],
  },
  featured: {
    name: "Product grid",
    description: "A row of products from a list you choose.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "source", label: "Which products", type: "select", options: PRODUCT_SOURCE_OPTIONS },
      { key: "limit", label: "How many", type: "number" },
      ...link("cta", "Button"),
    ],
  },
  gym: {
    name: "Gym spotlight",
    description: "Energetic dark section with features and gym products.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "stickerText", label: "Sticker on image (optional)", type: "text" },
      { key: "features", label: "Features", type: "list", itemLabel: "Feature", fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Short text", type: "text" },
        { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
      ] },
      { key: "source", label: "Products to show", type: "select", options: PRODUCT_SOURCE_OPTIONS },
      { key: "limit", label: "How many products", type: "number" },
      ...link("cta", "Button"),
    ],
  },
  story: {
    name: "Brand story",
    description: "Image and text storytelling block.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Story text", type: "textarea", help: "Leave an empty line between paragraphs." },
      { key: "image", label: "Main image", type: "image" },
      { key: "secondaryImage", label: "Second image", type: "image" },
      { key: "stats", label: "Numbers", type: "list", itemLabel: "Number", fields: [
        { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" },
      ] },
      ...link("button", "Button"),
    ],
  },
  whyus: {
    name: "Why us",
    description: "Feature cards explaining product benefits.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "cards", label: "Cards", type: "list", itemLabel: "Card", fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Text", type: "text" },
        { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
      ] },
    ],
  },
  banner: {
    name: "Promotional banner",
    description: "Offer or campaign banner.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
      { key: "code", label: "Coupon code to show (optional)", type: "text" },
      { key: "image", label: "Image", type: "image" },
      { key: "theme", label: "Colour", type: "select", options: [{ label: "Coral", value: "coral" }, { label: "Mint", value: "mint" }, { label: "Forest", value: "forest" }] },
      ...link("button", "Button"),
    ],
  },
  social: {
    name: "Reviews & social",
    description: "Shows testimonials, customer photos and Instagram cards (manage them under Testimonials).",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "handle", label: "Instagram handle", type: "text" },
      { key: "handleUrl", label: "Instagram link", type: "url" },
    ],
  },
  newsletter: {
    name: "Newsletter",
    description: "Email sign-up block.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
      { key: "placeholder", label: "Input placeholder", type: "text" },
      { key: "buttonLabel", label: "Button text", type: "text" },
      { key: "successMessage", label: "Message after sign-up", type: "text" },
    ],
  },
};

const linkFields: Field[] = [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "Link", type: "url" }];

export const SETTINGS_SCHEMAS: Record<string, { name: string; fields: Field[] }> = {
  site: {
    name: "Brand & contact",
    fields: [
      { key: "brandName", label: "Brand name", type: "text", help: "Shown in the header, footer, emails and page titles." },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "logoUrl", label: "Logo (optional — brand name is shown if empty)", type: "image" },
      { key: "faviconUrl", label: "Favicon", type: "image" },
      { key: "email", label: "Support email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "whatsapp", label: "WhatsApp number (with country code)", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "businessHours", label: "Support hours", type: "text" },
      { key: "legalName", label: "Registered business name", type: "text" },
      { key: "gstin", label: "GSTIN", type: "text" },
    ],
  },
  social: {
    name: "Social media",
    fields: ["instagram", "facebook", "pinterest", "youtube", "twitter"].map((k) => ({ key: k, label: k[0].toUpperCase() + k.slice(1) + " URL", type: "url" as const })),
  },
  seo: {
    name: "SEO defaults",
    fields: [
      { key: "defaultTitle", label: "Homepage SEO title", type: "text" },
      { key: "titleTemplate", label: "Title template", type: "text", help: "%s is replaced by the page title." },
      { key: "description", label: "Default meta description", type: "textarea" },
      { key: "ogImage", label: "Default share image (OG)", type: "image" },
      { key: "keywords", label: "Keywords", type: "text" },
    ],
  },
  commerce: {
    name: "Shipping & payments",
    fields: [
      { key: "freeShippingThreshold", label: "Free shipping above (₹)", type: "number" },
      { key: "shippingFee", label: "Shipping fee below that (₹)", type: "number" },
      { key: "codEnabled", label: "Allow Cash on Delivery", type: "toggle" },
      { key: "codFee", label: "COD fee (₹)", type: "number" },
      { key: "estimatedDelivery", label: "Delivery estimate text", type: "text" },
      { key: "lowStockThreshold", label: "Low stock alert at (units)", type: "number" },
    ],
  },
  announcement: {
    name: "Announcement bar",
    fields: [
      { key: "enabled", label: "Show announcement bar", type: "toggle" },
      { key: "text", label: "Text", type: "text" },
      { key: "link", label: "Link", type: "url" },
    ],
  },
  footer: {
    name: "Footer",
    fields: [
      { key: "description", label: "Brand description", type: "textarea" },
      { key: "columns", label: "Link columns", type: "list", itemLabel: "Column", fields: [
        { key: "title", label: "Column title", type: "text" },
        { key: "links", label: "Links", type: "list", itemLabel: "Link", fields: linkFields },
      ] },
      { key: "paymentIcons", label: "Payment methods shown", type: "list", itemLabel: "Method", fields: [{ key: "name", label: "Name", type: "text" }] },
      { key: "copyright", label: "Copyright line", type: "text", help: "{year} and {brand} are filled in automatically." },
      { key: "bottomNote", label: "Small note", type: "text" },
    ],
  },
  productPage: {
    name: "Product page info",
    fields: [
      { key: "shippingInfo", label: "Shipping information", type: "textarea" },
      { key: "returnInfo", label: "Return information", type: "textarea" },
      { key: "trustBadges", label: "Trust badges", type: "list", itemLabel: "Badge", fields: [{ key: "text", label: "Text", type: "text" }] },
    ],
  },
};
