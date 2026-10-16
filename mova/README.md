# MOVA — Premium D2C Store with Admin & CMS

A complete e-commerce website for handkerchiefs and gym towels: a fast, design-led storefront plus an admin panel where **everything on the site is editable without touching code** — text, images, homepage sections, products, prices, stock, menus, footer, policies, offers and SEO.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Supabase) with Drizzle ORM · Supabase Storage for images · Razorpay payments · Cash on Delivery.

---

## 1. Run it on your computer (15 minutes)

You need **Node.js 20+** and a **PostgreSQL** database (a free Supabase project is easiest — see step 2).

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET (see below)
npm run db:push               # creates all tables
npm run db:seed               # adds demo products, homepage content, pages, FAQs, admin user
npm run dev                   # open http://localhost:3000
```

Admin panel: **http://localhost:3000/admin**
Default login (from `.env`): `admin@mova.in` / `ChangeMe!2026` — change it straight away under **Admin → My account**.

Generate `AUTH_SECRET` with `openssl rand -base64 48` (any random string of 32+ characters works).

With no Razorpay keys and `ALLOW_MOCK_PAYMENTS=true`, "Pay online" is simulated in development so you can test the full flow. Test payments are always disabled in production.

---

## 2. Set up Supabase (database + image storage)

1. Create a project at [supabase.com](https://supabase.com).
2. **Database:** Project Settings → Database → *Connection string* → copy the **Transaction pooler** URI into `DATABASE_URL` (replace `[YOUR-PASSWORD]`).
3. **Storage:** Storage → *New bucket* → name it `media` → tick **Public bucket**.
4. Project Settings → API → copy the **Project URL** into `SUPABASE_URL` and the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`. Keep this key secret; it's only used on the server.
5. Run `npm run db:push` and `npm run db:seed` once against the new database.

If the Supabase storage variables are empty, uploads are saved to `public/uploads` — fine locally, but **not** on Vercel (its disk is temporary), so set up storage before going live.

---

## 3. Set up Razorpay

1. In the Razorpay Dashboard → Settings → **API Keys**, generate keys and put them in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Use Test Mode keys first.
2. Settings → **Webhooks** → add:
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`, `refund.processed`
   - Choose a secret and put it in `RAZORPAY_WEBHOOK_SECRET`.
3. Set `ALLOW_MOCK_PAYMENTS=false`.

The webhook matters: if a shopper pays but closes the tab before returning to your site, the webhook still marks the order paid and reserves stock.

Cash on Delivery, its fee, and shipping charges are set in **Admin → Shipping & payments**.

---

## 4. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add every variable from `.env.example` under *Environment Variables*, with production values:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (used for SEO, sitemap and share links)
   - `ALLOW_MOCK_PAYMENTS=false`
   - a fresh, long `AUTH_SECRET`
4. Deploy, then add your domain under Project → Settings → Domains.
5. In Supabase, run `npm run db:seed` once (from your computer, pointing `DATABASE_URL` at production) if you haven't already.

Need another admin, or locked out? Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and run `npm run admin:create`.

---

## 5. What you can edit in Admin

| Admin menu | What it controls |
|---|---|
| **Dashboard** | Revenue, orders, units sold, products, customers, low-stock alerts, 14-day chart, recent orders |
| **Orders** | Search and filter; update payment, order and shipping status; add courier and tracking number (customers see it on the Track Order page) |
| **Products** | Add, edit, duplicate, enable/disable, delete. Images (upload, reorder), MRP, sale price, stock, SKU, category, colour/size variants with their own price and stock, specifications, badges, Featured / Bestseller / New flags, SEO title, description, URL and share image |
| **Categories** | Name, URL, image, description, enable/disable, order, SEO |
| **Offers & coupons** | Percentage or flat codes, minimum order, cap, usage limit, expiry, prepaid-only |
| **Product reviews** | Approve or remove reviews submitted on product pages |
| **Customers** | Accounts and guest buyers, with full order history |
| **Homepage** | Every section's text, images, buttons and product source. Show/hide, drag to reorder, add, duplicate or delete sections |
| **Navigation** | Menu names, links, order, visibility (the `/cart` item's name is used for the bag button) |
| **Testimonials** | Reviews, customer photos and Instagram cards for “Caught in the Wild” |
| **Pages & policies** | Our Story, Hello There, FAQs page, shipping/return/refund/privacy/terms — or new pages |
| **FAQs** | Questions, answers and groups |
| **Footer** | Description, link columns, payment methods, copyright |
| **Announcement bar** | Top strip text, link, on/off |
| **Brand & contact** | Brand name, logo, favicon, email, phone, WhatsApp, address, hours, GSTIN |
| **Social media · SEO · Shipping & payments · Product page info** | Social links, default SEO and share image, shipping/COD fees, low-stock threshold, shipping/returns text on product pages |
| **Inbox & subscribers** | Contact-form messages and newsletter sign-ups (CSV export) |

Changes appear on the live site as soon as you save.

**Example:** Admin → Homepage → *Hero banner* → change the Heading from `SOFTNESS THAT MOVES WITH YOU.` to `YOUR EVERYDAY COMFORT.` → **Save section**. Each new line in the heading box becomes a new line on the page.

---

## 6. Project structure

```
src/
  app/(store)/        storefront pages (home, collection, /c/[slug], /p/[slug], cart, checkout, order, track, account, CMS pages)
  app/admin/          admin panel (login + (panel) pages) and all admin server actions (actions.ts)
  app/api/            cart pricing, checkout, payments, webhook, uploads, contact, newsletter, reviews
  components/store/   storefront UI        components/sections/  homepage sections
  components/admin/   admin UI (schema-driven FieldEditor, HomepageBuilder, ProductForm, EntityManager…)
  db/                 schema.ts, seed.ts, create-admin.ts
  lib/                cms, catalog, orders, auth, razorpay, storage, seo, validation
  lib/schemas.ts      field definitions for homepage sections & settings — add a field here and it appears in Admin automatically
  lib/admin-entities.ts  field definitions for nav, categories, testimonials, FAQs, coupons, pages
```

Useful commands: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:seed -- --force` (**wipes** and reseeds all data).

---

## 7. Security & how things work

- **Prices are never trusted from the browser.** The server re-prices every cart and order from the database, including variants, coupons, shipping and COD fees.
- **Payments:** Razorpay signatures are verified on return and on the webhook. Stock is deducted exactly once per order — when a COD order is placed or a payment is confirmed.
- **Admin:** passwords are hashed with bcrypt; sessions are signed, HTTP-only cookies; every admin page, action and API checks the session; login is rate-limited.
- **Shoppers** can only view an order with the matching order number *and* email (or when signed in).
- Contact form has a spam honeypot and rate limit; the Razorpay webhook rejects unsigned requests.
- SEO: per-page titles/descriptions/share images, canonical URLs, sitemap.xml, robots.txt, and Organization, WebSite, Product, Breadcrumb and FAQ structured data.

### Known limitations — worth addressing as you grow

1. **Guest orders and registration.** Registering with an email shows that email's past guest orders in the account. There's no email verification, so someone could register with another person's email to see their guest orders. Add email verification (e.g. a magic link via Resend) before relying on accounts.
2. **Rate limiting is per server instance.** On Vercel's multiple instances it's weaker; for strict limits use Upstash Redis.
3. **Last-unit race.** Stock is checked before an order is created, so two people buying the very last units at the same instant could both succeed (stock never goes below 0). Fine at small scale; tighten with a database reservation step if you run flash sales.
4. **Emails.** Order confirmation and shipping emails aren't sent yet — the order page and Track Order page show status. Adding a provider such as Resend is the natural next step.
5. **Demo content.** Product images are generated brand illustrations and lifestyle photos load from Unsplash. Replace them with your own photography in Admin; the placeholder values in *Brand & contact* (phone, address, social links) should also be updated.
