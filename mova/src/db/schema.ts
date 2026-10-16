import {
  pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ───────────── Auth ───────────── */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull().default("Admin"),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ───────────── CMS ───────────── */
/** Key/value JSON settings: site, social, seo, commerce, announcement, footer, productPage, newsletter */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const navItems = pgTable("nav_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  openInNewTab: boolean("open_in_new_tab").notNull().default(false),
});

export const homeSections = pgTable("home_sections", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 32 }).notNull(),
  label: text("label").notNull(),
  content: jsonb("content").notNull().default({}),
  isVisible: boolean("is_visible").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  template: varchar("template", { length: 20 }).notNull().default("default"), // default | about | contact | faq
  content: text("content").notNull().default(""),
  heroImage: text("hero_image"),
  isPublished: boolean("is_published").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 16 }).notNull().default("review"), // review | photo | instagram
  name: text("name").notNull(),
  location: text("location"),
  quote: text("quote"),
  rating: integer("rating").notNull().default(5),
  imageUrl: text("image_url"),
  avatarUrl: text("avatar_url"),
  handle: text("handle"),
  link: text("link"),
  productName: text("product_name"),
  isVisible: boolean("is_visible").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("General"),
  position: integer("position").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

/* ───────────── Catalog ───────────── */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
});

export type Spec = { label: string; value: string };

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  shortDescription: text("short_description"),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(), // MRP in INR (whole rupees)
  salePrice: integer("sale_price"), // selling price if discounted
  stock: integer("stock").notNull().default(0), // used when product has no variants
  images: jsonb("images").$type<string[]>().notNull().default([]),
  specifications: jsonb("specifications").$type<Spec[]>().notNull().default([]),
  badge: text("badge"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({ catIdx: index("products_category_idx").on(t.categoryId) }));

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  color: text("color"),
  colorHex: varchar("color_hex", { length: 9 }),
  size: text("size"),
  sku: varchar("sku", { length: 64 }).notNull(),
  price: integer("price"), // optional override of MRP
  salePrice: integer("sale_price"), // optional override of sale price
  stock: integer("stock").notNull().default(0),
  position: integer("position").notNull().default(0),
}, (t) => ({ prodIdx: index("variants_product_idx").on(t.productId), skuIdx: uniqueIndex("variants_sku_idx").on(t.sku) }));

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ prodIdx: index("reviews_product_idx").on(t.productId) }));

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  description: text("description"),
  type: varchar("type", { length: 10 }).notNull().default("percent"), // percent | flat
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  prepaidOnly: boolean("prepaid_only").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
});

/* ───────────── Customers & Orders ───────────── */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Address = { line1: string; line2?: string; city: string; state: string; pincode: string; country: string; landmark?: string };

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 24 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }).notNull(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<Address>().notNull(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  shipping: integer("shipping").notNull().default(0),
  codFee: integer("cod_fee").notNull().default(0),
  total: integer("total").notNull(),
  couponCode: varchar("coupon_code", { length: 40 }),
  paymentMethod: varchar("payment_method", { length: 16 }).notNull(), // razorpay | cod
  paymentStatus: varchar("payment_status", { length: 16 }).notNull().default("pending"), // pending | paid | failed | refunded
  orderStatus: varchar("order_status", { length: 16 }).notNull().default("pending"), // pending | confirmed | processing | cancelled | completed
  shippingStatus: varchar("shipping_status", { length: 16 }).notNull().default("unfulfilled"), // unfulfilled | packed | shipped | in_transit | delivered | returned
  courier: text("courier"),
  trackingNumber: text("tracking_number"),
  razorpayOrderId: varchar("razorpay_order_id", { length: 64 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 64 }),
  stockCommitted: boolean("stock_committed").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({ rzpIdx: index("orders_rzp_idx").on(t.razorpayOrderId), custIdx: index("orders_customer_idx").on(t.customerId) }));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  variantLabel: text("variant_label"),
  image: text("image"),
  sku: varchar("sku", { length: 64 }),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/* ───────────── Relations ───────────── */
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  reviews: many(reviews),
}));
export const variantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
export const customersRelations = relations(customers, ({ many }) => ({ orders: many(orders) }));

export type Product = typeof products.$inferSelect;
export type Variant = typeof productVariants.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type HomeSection = typeof homeSections.$inferSelect;
export type NavItem = typeof navItems.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Review = typeof reviews.$inferSelect;
