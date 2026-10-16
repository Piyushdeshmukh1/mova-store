/**
 * Generic admin collections. Each entity declares its editable fields once; the
 * admin UI (EntityManager) and the server action (saveEntity) both read this.
 */
import type { Field } from "./schemas";

export type EntityKey = "nav" | "categories" | "testimonials" | "faqs" | "coupons" | "pages";

export type EntityConfig = {
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  sortable: boolean;
  visibleKey?: string; // boolean column toggled from the list
  defaults: Record<string, unknown>;
};

const seo: Field[] = [
  { key: "seoTitle", label: "SEO title", type: "text", help: "Leave empty to use the name." },
  { key: "seoDescription", label: "Meta description", type: "textarea", help: "Aim for 140–160 characters." },
  { key: "ogImage", label: "Social share image (OG)", type: "image" },
];

export const ENTITIES: Record<EntityKey, EntityConfig> = {
  nav: {
    title: "Navigation", singular: "menu item",
    description: "Menu shown in the header and mobile menu. Drag to reorder. The item linking to /cart is used as the bag button label.",
    titleKey: "label", subtitleKey: "url", sortable: true, visibleKey: "isVisible",
    defaults: { label: "NEW LINK", url: "/", isVisible: true, openInNewTab: false },
    fields: [
      { key: "label", label: "Menu name", type: "text", required: true, half: true },
      { key: "url", label: "Link (e.g. /collection or https://…)", type: "url", required: true, half: true },
      { key: "isVisible", label: "Visible", type: "toggle", half: true },
      { key: "openInNewTab", label: "Open in new tab", type: "toggle", half: true },
    ],
  },
  categories: {
    title: "Categories", singular: "category",
    description: "Collections shown at /c/[slug]. Drag to change their order in filters.",
    titleKey: "name", subtitleKey: "slug", imageKey: "imageUrl", sortable: true, visibleKey: "isActive",
    defaults: { name: "New category", slug: "", isActive: true },
    fields: [
      { key: "name", label: "Name", type: "text", required: true, half: true },
      { key: "slug", label: "URL slug", type: "text", help: "Used in /c/slug. Leave empty to generate from the name.", half: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "imageUrl", label: "Category image", type: "image" },
      { key: "isActive", label: "Enabled", type: "toggle" },
      ...seo,
    ],
  },
  testimonials: {
    title: "Testimonials & social", singular: "card",
    description: "Cards in the “Caught in the wild” section: reviews, customer photos and Instagram posts.",
    titleKey: "name", subtitleKey: "kind", imageKey: "imageUrl", sortable: true, visibleKey: "isVisible",
    defaults: { kind: "review", name: "Customer name", rating: 5, isVisible: true },
    fields: [
      { key: "kind", label: "Card type", type: "select", half: true, options: [
        { label: "Review (text)", value: "review" }, { label: "Customer photo", value: "photo" }, { label: "Instagram post", value: "instagram" },
      ] },
      { key: "rating", label: "Rating (1–5)", type: "number", half: true },
      { key: "name", label: "Customer name", type: "text", required: true, half: true },
      { key: "location", label: "City", type: "text", half: true },
      { key: "quote", label: "Quote / caption", type: "textarea" },
      { key: "productName", label: "Product mentioned", type: "text", half: true },
      { key: "handle", label: "Instagram handle", type: "text", half: true },
      { key: "imageUrl", label: "Photo", type: "image" },
      { key: "avatarUrl", label: "Avatar", type: "image" },
      { key: "link", label: "Link (e.g. Instagram post URL)", type: "url" },
      { key: "isVisible", label: "Visible", type: "toggle" },
    ],
  },
  faqs: {
    title: "FAQs", singular: "question",
    description: "Shown on the FAQ page, grouped by category.",
    titleKey: "question", subtitleKey: "category", sortable: true, visibleKey: "isVisible",
    defaults: { question: "New question?", answer: "", category: "General", isVisible: true },
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Answer", type: "textarea", required: true },
      { key: "category", label: "Group", type: "text", half: true },
      { key: "isVisible", label: "Visible", type: "toggle", half: true },
    ],
  },
  coupons: {
    title: "Offers & coupons", singular: "coupon",
    description: "Discount codes shoppers can apply in the bag. Show them on the site with a Promotional banner or the announcement bar.",
    titleKey: "code", subtitleKey: "summary", sortable: false, visibleKey: "isActive",
    defaults: { code: "NEWCODE", type: "percent", value: 10, minOrder: 0, isActive: true, prepaidOnly: false },
    fields: [
      { key: "code", label: "Code", type: "text", required: true, half: true },
      { key: "description", label: "Internal note", type: "text", half: true },
      { key: "type", label: "Discount type", type: "select", half: true, options: [{ label: "Percentage (%)", value: "percent" }, { label: "Flat amount (₹)", value: "flat" }] },
      { key: "value", label: "Value", type: "number", required: true, half: true },
      { key: "minOrder", label: "Minimum order (₹)", type: "number", half: true },
      { key: "maxDiscount", label: "Max discount (₹, optional)", type: "number", half: true },
      { key: "usageLimit", label: "Total uses allowed (optional)", type: "number", half: true },
      { key: "expiresAt", label: "Expires on (optional)", type: "date", half: true },
      { key: "prepaidOnly", label: "Prepaid orders only", type: "toggle", half: true },
      { key: "isActive", label: "Active", type: "toggle", half: true },
    ],
  },
  pages: {
    title: "Pages & policies", singular: "page",
    description: "About, contact, FAQ and policy pages. Content supports simple Markdown: ## headings, **bold**, - lists, [links](/url).",
    titleKey: "title", subtitleKey: "slug", imageKey: "heroImage", sortable: false, visibleKey: "isPublished",
    defaults: { title: "NEW PAGE", slug: "", template: "default", content: "", isPublished: false },
    fields: [
      { key: "title", label: "Title", type: "text", required: true, half: true },
      { key: "slug", label: "URL slug", type: "text", help: "Page lives at /slug.", half: true },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "template", label: "Layout", type: "select", half: true, options: [
        { label: "Text page (policies)", value: "default" }, { label: "About / story", value: "about" },
        { label: "Contact (form + contact details)", value: "contact" }, { label: "FAQ (shows FAQs)", value: "faq" },
      ] },
      { key: "isPublished", label: "Published", type: "toggle", half: true },
      { key: "heroImage", label: "Header image", type: "image" },
      { key: "content", label: "Content", type: "markdown" },
      ...seo,
    ],
  },
};
