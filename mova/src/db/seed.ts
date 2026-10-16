/* eslint-disable no-console */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "./schema";
import { DEFAULT_SETTINGS, IMG } from "../lib/defaults";

const pg = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const db = drizzle(pg, { schema: s });

const force = process.argv.includes("--force");

async function main() {
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(s.products);
  if (c > 0 && !force) {
    console.log("Database already has products. Run `npm run db:seed -- --force` to wipe and reseed.");
    return;
  }
  if (force) {
    console.log("Wiping existing data…");
    await db.execute(sql`TRUNCATE order_items, orders, customers, reviews, product_variants, products, categories,
      coupons, testimonials, faqs, pages, home_sections, nav_items, settings, subscribers, contact_messages RESTART IDENTITY CASCADE`);
  }

  /* ── Admin ── */
  const email = (process.env.ADMIN_EMAIL || "admin@mova.in").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe!2026";
  await db.insert(s.adminUsers).values({ email, name: "Store Owner", passwordHash: await bcrypt.hash(password, 12) }).onConflictDoNothing();

  /* ── Settings ── */
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
  }

  /* ── Navigation ── */
  await db.insert(s.navItems).values([
    { label: "THE EDIT", url: "/", position: 0 },
    { label: "THE COLLECTION", url: "/collection", position: 1 },
    { label: "GYM MODE", url: "/c/gym-towels", position: 2 },
    { label: "DAILY ESSENTIALS", url: "/c/handkerchiefs", position: 3 },
    { label: "BUNDLED JOY", url: "/c/combo-packs", position: 4 },
    { label: "OUR STORY", url: "/our-story", position: 5 },
    { label: "HELLO THERE", url: "/hello-there", position: 6 },
    { label: "MY BAG", url: "/cart", position: 7 },
  ]);

  /* ── Categories ── */
  const [hanky, gym, combo] = await db.insert(s.categories).values([
    { name: "Daily Essentials", slug: "handkerchiefs", tagline: "Handkerchiefs", position: 1, imageUrl: "/demo/cat-hanky.svg",
      description: "Soft, breathable handkerchiefs woven from long-staple cotton — gentle on skin, easy to carry, better with every wash.",
      seoTitle: "Premium Cotton Handkerchiefs", seoDescription: "Ultra-soft cotton handkerchiefs for men and women. Breathable, quick to dry and made to last. Shop packs from ₹379." },
    { name: "Gym Mode", slug: "gym-towels", tagline: "Gym Towels", position: 2, imageUrl: "/demo/cat-gym.svg",
      description: "Lightweight, super-absorbent towels built for sweat sessions — they dry fast, pack small and stay fresh.",
      seoTitle: "Quick-Dry Gym Towels", seoDescription: "Absorbent, lightweight, quick-dry gym towels for training, running and yoga. Free shipping over ₹799." },
    { name: "Bundled Joy", slug: "combo-packs", tagline: "Combo Packs", position: 3, imageUrl: "/demo/cat-combo.svg",
      description: "Thoughtfully paired sets that save you more — for yourself, or for someone who deserves softer days.",
      seoTitle: "Combo Packs & Gift Boxes", seoDescription: "Save more with handkerchief and gym towel combo packs. Perfect for gifting." },
  ]).returning();

  /* ── Products ── */
  type V = { color?: string; colorHex?: string; size?: string; price?: number; salePrice?: number; stock: number };
  const P = async (d: {
    name: string; slug: string; sku: string; cat: number; short: string; desc: string; price: number; sale: number | null;
    stock?: number; imgs: string[]; specs: [string, string][]; badge?: string; featured?: boolean; best?: boolean; isNew?: boolean; variants?: V[];
  }) => {
    const [p] = await db.insert(s.products).values({
      name: d.name, slug: d.slug, sku: d.sku, categoryId: d.cat, shortDescription: d.short, description: d.desc,
      price: d.price, salePrice: d.sale, stock: d.stock ?? 0, images: d.imgs, badge: d.badge ?? null,
      specifications: d.specs.map(([label, value]) => ({ label, value })),
      isFeatured: !!d.featured, isBestseller: !!d.best, isNewArrival: !!d.isNew,
      seoTitle: d.name, seoDescription: d.short,
    }).returning();
    if (d.variants?.length) {
      await db.insert(s.productVariants).values(d.variants.map((v, i) => ({
        productId: p.id, color: v.color ?? null, colorHex: v.colorHex ?? null, size: v.size ?? null,
        sku: `${d.sku}-${(v.color ?? "").slice(0, 3).toUpperCase()}${v.size ? "-" + v.size.slice(0, 1).toUpperCase() : ""}${i}`,
        price: v.price ?? null, salePrice: v.salePrice ?? null, stock: v.stock, position: i,
      })));
    }
    return p;
  };

  const cloud = await P({
    name: "Everyday Cloud Handkerchief", slug: "everyday-cloud-handkerchief", sku: "MV-HK-CLD", cat: hanky.id,
    short: "Pack of 3 feather-light cotton hankies that feel softer with every wash.",
    desc: "Meet the handkerchief you'll actually want to carry. Woven from 100% long-staple combed cotton with a fine 80s count, Cloud is feather-light, breathable and genuinely gentle on skin.\n\nThe edges are finished with a soft rolled hem so they never scratch, and the fabric gets softer every time you wash it. Fold one into your pocket, bag or gym kit — it's ready for every little moment.",
    price: 599, sale: 449, imgs: ["/demo/cloud-1.svg", "/demo/cloud-2.svg", IMG.fold], badge: "Bestseller", featured: true, best: true,
    specs: [["Material", "100% combed cotton, 80s count"], ["Size", "40 × 40 cm"], ["Pack", "3 handkerchiefs"], ["Care", "Machine wash warm, tumble dry low"], ["Made in", "India"]],
    variants: [
      { color: "Ivory White", colorHex: "#FBFAF6", stock: 64 },
      { color: "Fresh Mint", colorHex: "#B8E3D5", stock: 38 },
      { color: "Sage Mix", colorHex: "#C9D2CE", stock: 7 },
    ],
  });
  const freshfold = await P({
    name: "FreshFold Cotton Hanky", slug: "freshfold-cotton-hanky", sku: "MV-HK-FRF", cat: hanky.id,
    short: "Crisp, classic cotton handkerchiefs in a 5-pack for the everyday rotation.",
    desc: "A modern take on the classic. FreshFold is woven with a crisp, tight weave that holds a sharp pocket fold, yet stays soft and absorbent on the skin.\n\nFive handkerchiefs in understated tones — enough for the whole working week.",
    price: 799, sale: 599, imgs: ["/demo/freshfold-1.svg", "/demo/freshfold-2.svg", IMG.rack], featured: true,
    specs: [["Material", "100% cotton poplin"], ["Size", "42 × 42 cm"], ["Pack", "5 handkerchiefs"], ["Care", "Machine wash, warm iron"], ["Made in", "India"]],
    variants: [
      { color: "Classic White", colorHex: "#FFFFFF", stock: 80 },
      { color: "Oat & Charcoal", colorHex: "#E6DFD1", stock: 42 },
    ],
  });
  const softloop = await P({
    name: "SoftLoop Everyday Hanky", slug: "softloop-everyday-hanky", sku: "MV-HK-SLP", cat: hanky.id,
    short: "Terry-loop hankies that double as a mini face towel — perfect for travel and commutes.",
    desc: "SoftLoop has a plush micro-terry face on one side and smooth cotton on the other. It soaks up sweat on hot commutes, travel days and summer afternoons — then dries quickly in your bag.",
    price: 499, sale: 379, imgs: ["/demo/softloop-1.svg", "/demo/softloop-2.svg", IMG.travel], badge: "New", isNew: true, featured: true,
    specs: [["Material", "Cotton micro-terry / cotton plain"], ["Size", "30 × 30 cm"], ["Pack", "3 hankies"], ["GSM", "320"], ["Care", "Machine wash cold"]],
    variants: [
      { color: "Coral Pop", colorHex: "#FF8066", stock: 30 },
      { color: "Mint Fresh", colorHex: "#B8E3D5", stock: 26 },
      { color: "Forest", colorHex: "#123C35", stock: 4 },
    ],
  });
  const activedry = await P({
    name: "ActiveDry Gym Towel", slug: "activedry-gym-towel", sku: "MV-GT-ADR", cat: gym.id,
    short: "Ultra-absorbent microfibre gym towel that dries 3× faster than cotton.",
    desc: "Built for the bench, the mat and everything in between. ActiveDry uses a split-weave microfibre that absorbs up to 5× its weight and dries three times faster than regular cotton.\n\nA zip pocket fits your keys and cards, and the magnetic clip keeps it on the bench while you train.",
    price: 899, sale: 649, imgs: ["/demo/activedry-1.svg", "/demo/activedry-2.svg", IMG.gym2], badge: "Bestseller", featured: true, best: true,
    specs: [["Material", "Split-weave microfibre (80/20)"], ["GSM", "380"], ["Features", "Zip pocket, magnetic clip"], ["Absorbency", "Up to 5× its weight"], ["Care", "Machine wash cold, no softener"]],
    variants: [
      { color: "Forest", colorHex: "#123C35", size: "Standard 40×80 cm", stock: 45 },
      { color: "Forest", colorHex: "#123C35", size: "Large 50×100 cm", price: 1049, salePrice: 799, stock: 22 },
      { color: "Charcoal", colorHex: "#202725", size: "Standard 40×80 cm", stock: 40 },
      { color: "Charcoal", colorHex: "#202725", size: "Large 50×100 cm", price: 1049, salePrice: 799, stock: 8 },
      { color: "Coral", colorHex: "#FF8066", size: "Standard 40×80 cm", stock: 18 },
      { color: "Coral", colorHex: "#FF8066", size: "Large 50×100 cm", price: 1049, salePrice: 799, stock: 0 },
    ],
  });
  const sweatsync = await P({
    name: "SweatSync Training Towel", slug: "sweatsync-training-towel", sku: "MV-GT-SSY", cat: gym.id,
    short: "A slim, fast-wicking towel sized for the neck, bench and treadmill.",
    desc: "SweatSync is long and slim, so it drapes around your neck or across the treadmill console without getting in the way. Its waffle knit wicks sweat instantly and air-dries by the time you're home.",
    price: 749, sale: 549, imgs: ["/demo/sweatsync-1.svg", "/demo/sweatsync-2.svg", IMG.run], featured: true,
    specs: [["Material", "Waffle-knit polyester blend"], ["Size", "25 × 110 cm"], ["Weight", "90 g"], ["Care", "Machine wash cold"]],
    variants: [
      { color: "Charcoal", colorHex: "#2C3532", stock: 50 },
      { color: "Sage", colorHex: "#71837C", stock: 33 },
    ],
  });
  const flexdry = await P({
    name: "FlexDry Performance Towel", slug: "flexdry-performance-towel", sku: "MV-GT-FXD", cat: gym.id,
    short: "Cooling performance towel — wet, wring, snap and feel the chill.",
    desc: "Our most advanced towel. FlexDry's hyper-evaporative fabric cools up to 12°C below body temperature when wet — ideal for HIIT, outdoor runs and hot yoga. It folds into its own pouch and weighs next to nothing.",
    price: 1199, sale: 899, imgs: ["/demo/flexdry-1.svg", "/demo/flexdry-2.svg", IMG.yoga], badge: "New", isNew: true, featured: true,
    specs: [["Material", "Hyper-evaporative PVA blend"], ["Size", "30 × 100 cm"], ["Includes", "Carry pouch with clip"], ["Care", "Rinse and air dry"]],
    variants: [
      { color: "Mint", colorHex: "#B8E3D5", stock: 28 },
      { color: "Deep Forest", colorHex: "#1A4D44", stock: 31 },
    ],
  });
  const duo = await P({
    name: "Daily Fresh Duo", slug: "daily-fresh-duo", sku: "MV-CB-DFD", cat: combo.id,
    short: "Cloud + FreshFold together — 8 handkerchiefs for the whole fortnight.",
    desc: "Our two most-loved handkerchiefs in one easy set: 3 Everyday Cloud and 5 FreshFold. Save more than buying separately and never run out again.",
    price: 1099, sale: 799, stock: 60, imgs: ["/demo/duo-1.svg", "/demo/duo-2.svg", IMG.fold], best: true,
    specs: [["Includes", "3 × Cloud + 5 × FreshFold"], ["Material", "100% cotton"], ["You save", "₹249 vs. separately"]],
  });
  const gymgo = await P({
    name: "Gym & Go Pack", slug: "gym-and-go-pack", sku: "MV-CB-GNG", cat: combo.id,
    short: "ActiveDry towel + SoftLoop hankies + a travel pouch. Your on-the-go kit.",
    desc: "Everything you need for training days and travel days: an ActiveDry Gym Towel, a 3-pack of SoftLoop hankies and a water-resistant zip pouch to keep it all together.",
    price: 1599, sale: 1149, stock: 34, imgs: ["/demo/gymgo-1.svg", "/demo/gymgo-2.svg", IMG.gym3], badge: "Save 28%", featured: true,
    specs: [["Includes", "1 ActiveDry towel, 3 SoftLoop hankies, 1 pouch"], ["Pouch", "Water-resistant nylon"], ["Great for", "Gym, travel, commute"]],
  });
  const box = await P({
    name: "Everyday Essentials Box", slug: "everyday-essentials-box", sku: "MV-CB-EEB", cat: combo.id,
    short: "The complete gift box — towels, hankies and a handwritten note.",
    desc: "Our signature gift box: FlexDry Performance Towel, SweatSync Training Towel, 3 Everyday Cloud handkerchiefs and a personalised note, packed in a keepsake box. Ready to gift.",
    price: 2499, sale: 1799, stock: 18, imgs: ["/demo/box-1.svg", "/demo/box-2.svg", IMG.hero2], badge: "Gift ready", isNew: true,
    specs: [["Includes", "FlexDry, SweatSync, 3 × Cloud hankies"], ["Packaging", "Recyclable keepsake box"], ["Gift note", "Add a message at checkout"]],
  });

  /* ── Reviews ── */
  const rv = (productId: number, name: string, rating: number, title: string, body: string) => ({ productId, name, rating, title, body, isApproved: true });
  await db.insert(s.reviews).values([
    rv(cloud.id, "Ananya R.", 5, "So soft!", "Genuinely the softest hanky I've owned. Washed it five times already and it only gets better."),
    rv(cloud.id, "Karthik S.", 5, "Daily carry", "Light, absorbent and looks premium. Bought a second pack for my dad."),
    rv(cloud.id, "Meera P.", 4, "Lovely colours", "Mint is gorgeous. Wish there was a bigger pack."),
    rv(freshfold.id, "Rohit V.", 5, "Holds the fold", "Crisp enough for office, soft enough for summer."),
    rv(freshfold.id, "Sneha K.", 4, "Great value", "Five hankies at this price is a steal."),
    rv(softloop.id, "Ishaan M.", 5, "Travel essential", "Used it on a Mumbai local every day. Dries so quickly in my bag."),
    rv(activedry.id, "Arjun D.", 5, "Best gym towel", "Zip pocket is genius. Absorbs everything and doesn't smell."),
    rv(activedry.id, "Priya N.", 5, "Magnetic clip ftw", "Stays on the bench the whole session. Love the coral."),
    rv(activedry.id, "Vikram T.", 4, "Dries fast", "Dries in an hour after washing. Would love more colours."),
    rv(sweatsync.id, "Neha G.", 5, "Perfect for treadmill", "Slim size is exactly what I needed."),
    rv(flexdry.id, "Aditya B.", 5, "It actually cools", "Wet it before a run in Chennai heat — works."),
    rv(gymgo.id, "Tanvi J.", 5, "Gifted to my brother", "Great packaging, he loved it."),
    rv(box.id, "Rahul C.", 5, "Beautiful gift box", "Felt really premium. The handwritten note was a lovely touch."),
    rv(duo.id, "Fatima A.", 5, "Stocked up", "Never running out of hankies again."),
  ]);

  /* ── Homepage sections ── */
  await db.insert(s.homeSections).values([
    { type: "hero", label: "Hero", position: 0, content: {
      eyebrow: "",
      heading: "SOFTNESS THAT\nMOVES WITH YOU.",
      subheading: "Premium everyday essentials made for workouts, travel and everything in between.",
      primaryLabel: "EXPLORE THE COLLECTION", primaryUrl: "/collection",
      secondaryLabel: "ENTER GYM MODE", secondaryUrl: "/c/gym-towels",
      image: IMG.hero, secondaryImage: "/demo/activedry-1.svg", badgeText: "SOFTER WITH EVERY WASH",
      highlights: [{ text: "Free shipping over ₹799" }, { text: "4.8★ from 2,000+ customers" }, { text: "7-day easy returns" }],
    } },
    { type: "marquee", label: "Ticker", position: 1, content: {
      theme: "mint", items: [{ text: "Ultra soft" }, { text: "Quick dry" }, { text: "Made in India" }, { text: "Gym ready" }, { text: "Travel light" }, { text: "Gets softer every wash" }],
    } },
    { type: "moments", label: "Shop by moment", position: 2, content: {
      heading: "MADE FOR YOUR EVERYDAY MOMENTS.",
      subheading: "From your first coffee to your last rep — there's a MOVA for that.",
      cards: [
        { title: "MORNING FRESH", subtitle: "Everyday handkerchiefs", image: IMG.fold, url: "/c/handkerchiefs" },
        { title: "TRAIN HARD", subtitle: "Gym towels", image: IMG.gym2, url: "/c/gym-towels" },
        { title: "ON THE GO", subtitle: "Travel essentials", image: IMG.travel, url: "/collection?q=travel" },
        { title: "SHARE THE SOFTNESS", subtitle: "Combo packs", image: IMG.hero2, url: "/c/combo-packs" },
      ],
    } },
    { type: "featured", label: "Featured products", position: 3, content: {
      heading: "THE ONES YOU'LL REACH FOR EVERY DAY",
      subheading: "Our most-loved essentials, chosen by thousands of customers.",
      source: "featured", limit: 4, ctaLabel: "VIEW ALL PRODUCTS", ctaUrl: "/collection",
    } },
    { type: "gym", label: "Gym section", position: 4, content: {
      heading: "TRAIN HARD. STAY FRESH.",
      subheading: "Lightweight, absorbent and ready for every workout.",
      image: IMG.gym, stickerText: "Sweat. Wipe. Repeat.",
      features: [
        { title: "Quick Dry", text: "Dries 3× faster than cotton", icon: "timer" },
        { title: "Highly Absorbent", text: "Soaks up to 5× its weight", icon: "droplets" },
        { title: "Lightweight", text: "Packs into any gym bag", icon: "feather" },
        { title: "Soft Touch", text: "Gentle on sweaty skin", icon: "sparkles" },
      ],
      source: "cat:gym-towels", limit: 3, ctaLabel: "ENTER GYM MODE", ctaUrl: "/c/gym-towels",
    } },
    { type: "story", label: "Brand story", position: 5, content: {
      heading: "MADE FOR THE LITTLE MOMENTS.",
      body: "We started MOVA with a simple belief: the things you touch every day should feel good. Not just the big purchases — the small, quiet essentials that go everywhere with you.\n\nSo we obsessed over the details. Long-staple cotton that softens with every wash. Microfibre that dries before you're home. Hems that never scratch. Designed in India, made with care, built to be reached for again and again.",
      image: IMG.yoga, secondaryImage: "/demo/cloud-1.svg",
      stats: [{ value: "50k+", label: "Happy customers" }, { value: "4.8", label: "Average rating" }, { value: "100%", label: "Made in India" }],
      buttonLabel: "DISCOVER OUR STORY", buttonUrl: "/our-story",
    } },
    { type: "whyus", label: "Why us", position: 6, content: {
      heading: "WHY YOU'LL LOVE MOVA",
      subheading: "Four promises built into everything we make.",
      cards: [
        { title: "ULTRA SOFT", text: "Comfort you can feel.", icon: "feather" },
        { title: "QUICK DRY", text: "Made for busy and active days.", icon: "wind" },
        { title: "EASY TO CARRY", text: "Lightweight everyday essentials.", icon: "backpack" },
        { title: "MADE TO LAST", text: "Quality designed for repeated use.", icon: "shield" },
      ],
    } },
    { type: "banner", label: "Offer banner", position: 7, content: {
      heading: "BUNDLE UP & SAVE UP TO 30%",
      text: "Pair your favourites in our combo packs — made for gifting, sharing, or simply stocking up.",
      code: "", image: "/demo/gymgo-1.svg", theme: "coral", buttonLabel: "SHOP BUNDLED JOY", buttonUrl: "/c/combo-packs",
    } },
    { type: "social", label: "Customer & social", position: 8, content: {
      heading: "CAUGHT IN THE WILD",
      subheading: "Real people, real moments. Tag us to be featured.",
      handle: "@mova.essentials", handleUrl: "https://instagram.com/",
    } },
    { type: "newsletter", label: "Newsletter", position: 9, content: {
      heading: "STAY IN THE LOOP.",
      text: "Fresh drops, special offers and everyday essentials — straight to your inbox.",
      placeholder: "Your email address", buttonLabel: "KEEP ME POSTED", successMessage: "You're in! Watch your inbox for something fresh.",
    } },
  ]);

  /* ── Testimonials ── */
  await db.insert(s.testimonials).values([
    { kind: "review", name: "Ananya Rao", location: "Bengaluru", rating: 5, avatarUrl: IMG.p1, productName: "Everyday Cloud Handkerchief", quote: "I didn't think a handkerchief could feel luxurious. Now I keep one in every bag.", position: 0 },
    { kind: "photo", name: "Arjun Desai", location: "Pune", rating: 5, imageUrl: IMG.gym2, avatarUrl: IMG.p2, handle: "@arjun.lifts", productName: "ActiveDry Gym Towel", quote: "The zip pocket changed my gym life. Keys, card, done.", position: 1 },
    { kind: "instagram", name: "Priya Nair", rating: 5, imageUrl: IMG.yoga, handle: "@priya.moves", link: "https://instagram.com/", quote: "Post-flow essentials ✨", position: 2 },
    { kind: "review", name: "Rohit Verma", location: "Mumbai", rating: 5, avatarUrl: IMG.p4, productName: "FreshFold Cotton Hanky", quote: "Crisp enough for boardrooms, soft enough for Mumbai summers.", position: 3 },
    { kind: "instagram", name: "Tanvi Joshi", rating: 5, imageUrl: IMG.run, handle: "@tanviruns", link: "https://instagram.com/", quote: "Sunday long run, sorted.", position: 4 },
    { kind: "photo", name: "Meera Pillai", location: "Kochi", rating: 5, imageUrl: IMG.hero2, avatarUrl: IMG.p3, handle: "@meera.everyday", productName: "Everyday Essentials Box", quote: "Gifted the Essentials Box to my sister — she's obsessed.", position: 5 },
    { kind: "review", name: "Karthik Sundar", location: "Chennai", rating: 5, avatarUrl: IMG.p6, productName: "FlexDry Performance Towel", quote: "Wet it, snap it, and it actually cools. In Chennai heat, that's magic.", position: 6 },
    { kind: "instagram", name: "Neha Gupta", rating: 5, imageUrl: IMG.gym3, handle: "@neha.strong", link: "https://instagram.com/", quote: "Leg day companion 🍑", position: 7 },
  ]);

  /* ── FAQs ── */
  await db.insert(s.faqs).values([
    { category: "Products", question: "What are MOVA handkerchiefs made of?", answer: "Our handkerchiefs are made from 100% long-staple combed cotton (Cloud, FreshFold) or a cotton micro-terry blend (SoftLoop). They're breathable, gentle on skin and get softer with each wash.", position: 0 },
    { category: "Products", question: "How are gym towels different from regular towels?", answer: "Our gym towels use split-weave microfibre or waffle knits that absorb far more sweat for their weight and dry up to 3× faster than cotton — so they stay fresh between sessions.", position: 1 },
    { category: "Care", question: "How should I wash my MOVA essentials?", answer: "Machine wash cold with similar colours. Avoid fabric softener on gym towels, as it coats the fibres and reduces absorbency. Tumble dry low or line dry.", position: 2 },
    { category: "Orders", question: "How long does delivery take?", answer: "Orders ship within 24 hours on working days and arrive in 3–6 working days across India. Metro cities are usually faster.", position: 3 },
    { category: "Orders", question: "Do you offer Cash on Delivery?", answer: "Yes, COD is available across India for a small handling fee. Prepaid orders via UPI, cards or netbanking often get an extra discount.", position: 4 },
    { category: "Returns", question: "What is your return policy?", answer: "Unused items in original packaging can be returned within 7 days of delivery. For hygiene reasons, opened handkerchief packs can only be exchanged if defective.", position: 5 },
    { category: "Orders", question: "Do you take bulk or corporate orders?", answer: "Absolutely — we do custom-branded gym towels and handkerchief gift sets for teams and events. Write to us via the Hello There page.", position: 6 },
  ]);

  /* ── Pages ── */
  await db.insert(s.pages).values([
    { slug: "our-story", title: "OUR STORY", subtitle: "Small essentials. Big difference.", template: "about", heroImage: IMG.yoga,
      seoTitle: "Our Story", seoDescription: "Why we started MOVA — premium, everyday essentials designed in India.",
      content: "## It started with a sweaty commute\n\nOne humid Mumbai morning, our founder reached for a handkerchief that felt like sandpaper — and a gym towel that was still damp from the night before. That was the moment MOVA began.\n\nWe believe the things you touch every day deserve as much care as the things you save up for. So we set out to make everyday essentials that feel genuinely good: softer, lighter, faster-drying and built to last.\n\n## How we make things\n\n- **Materials first.** Long-staple cotton for softness, split-weave microfibre for absorbency.\n- **Small batches.** Made with partner mills in Tiruppur and Panipat that we visit regularly.\n- **Tested in real life.** Every product is used for weeks — in gyms, on trains, on flights — before it reaches you.\n\n## What's next\n\nWe're just getting started. Thank you for letting MOVA be part of your little moments." },
    { slug: "hello-there", title: "HELLO THERE", subtitle: "Questions, feedback or bulk orders — we'd love to hear from you.", template: "contact",
      seoTitle: "Contact Us", seoDescription: "Get in touch with the MOVA team for orders, returns, feedback or bulk enquiries.",
      content: "We usually reply within one working day. For order questions, keep your order number handy." },
    { slug: "faqs", title: "FAQS", subtitle: "Everything you might want to know.", template: "faq", seoTitle: "FAQs", seoDescription: "Answers about products, orders, shipping, returns and care.", content: "" },
    { slug: "shipping-policy", title: "SHIPPING POLICY", template: "default", seoTitle: "Shipping Policy",
      content: "## Delivery timelines\n\nOrders are dispatched within 24 hours on working days and delivered within 3–6 working days across India.\n\n## Shipping charges\n\n- Free shipping on orders above ₹799.\n- A flat fee of ₹79 applies to orders below ₹799.\n- Cash on Delivery orders carry a ₹49 handling fee.\n\n## Tracking\n\nOnce your order ships, the courier name and tracking number appear on our [Track Order](/track) page — just enter your order number and email." },
    { slug: "return-policy", title: "RETURNS & EXCHANGES", template: "default", seoTitle: "Return Policy",
      content: "## 7-day easy returns\n\nIf you're not happy, return unused items in their original packaging within 7 days of delivery.\n\n## Hygiene exception\n\nFor hygiene reasons, handkerchief packs that have been opened can only be exchanged if they arrive damaged or defective.\n\n## How to start a return\n\n1. Write to us from the [Hello There](/hello-there) page with your order number.\n2. We'll schedule a free pickup within 48 hours.\n3. Refunds are processed within 5–7 working days of pickup." },
    { slug: "refund-policy", title: "REFUND POLICY", template: "default", seoTitle: "Refund Policy",
      content: "## Prepaid orders\n\nRefunds go back to your original payment method within 5–7 working days after the returned item passes quality check.\n\n## COD orders\n\nRefunds for COD orders are made by bank transfer or UPI. We'll ask for your details over email.\n\n## Cancelled orders\n\nOrders cancelled before dispatch are refunded in full, immediately." },
    { slug: "privacy-policy", title: "PRIVACY POLICY", template: "default", seoTitle: "Privacy Policy",
      content: "## What we collect\n\nWe collect your name, contact details and address to fulfil orders, plus basic analytics to improve the site.\n\n## Payments\n\nPayments are processed securely by Razorpay. We never store your card or UPI details.\n\n## Your rights\n\nYou can ask us to access, correct or delete your data at any time by writing to us." },
    { slug: "terms", title: "TERMS & CONDITIONS", template: "default", seoTitle: "Terms & Conditions",
      content: "## Using this site\n\nBy using this website you agree to these terms. Prices are in Indian Rupees and include applicable taxes.\n\n## Orders\n\nWe reserve the right to cancel orders in case of pricing errors or stock issues; you'll be refunded in full.\n\n## Governing law\n\nThese terms are governed by the laws of India, with courts in Pune having jurisdiction." },
  ]);

  /* ── Coupons ── */
  await db.insert(s.coupons).values([
    { code: "WELCOME10", description: "10% off your first order", type: "percent", value: 10, minOrder: 499, maxDiscount: 200 },
    { code: "PREPAID10", description: "Extra 10% off prepaid orders", type: "percent", value: 10, minOrder: 0, maxDiscount: 250, prepaidOnly: true },
    { code: "FLAT200", description: "₹200 off above ₹1999", type: "flat", value: 200, minOrder: 1999 },
  ]);

  console.log(`\n✅ Seeded. Admin login: ${email} / ${password}\n   Change the password after first login (Admin → Settings → Account).\n`);
}

main().then(() => pg.end()).catch(async (e) => { console.error(e); await pg.end(); process.exit(1); });
