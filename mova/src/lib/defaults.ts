/**
 * Content defaults. These are ONLY used to seed the database and as a safety
 * net if a settings row is missing. Every value here is editable in Admin.
 */

export type Link = { label: string; url: string };

export type SiteSettings = {
  brandName: string; tagline: string; logoUrl: string; faviconUrl: string;
  email: string; phone: string; whatsapp: string; address: string; businessHours: string; legalName: string; gstin: string;
};
export type SocialSettings = { instagram: string; facebook: string; pinterest: string; youtube: string; twitter: string };
export type SeoSettings = { defaultTitle: string; titleTemplate: string; description: string; ogImage: string; keywords: string };
export type CommerceSettings = {
  freeShippingThreshold: number; shippingFee: number; codEnabled: boolean; codFee: number; estimatedDelivery: string; lowStockThreshold: number;
};
export type AnnouncementSettings = { enabled: boolean; text: string; link: string };
export type FooterSettings = {
  description: string; columns: { title: string; links: Link[] }[]; copyright: string;
  paymentIcons: { name: string }[]; bottomNote: string;
};
export type ProductPageSettings = { shippingInfo: string; returnInfo: string; trustBadges: { text: string }[] };

export type SettingsMap = {
  site: SiteSettings; social: SocialSettings; seo: SeoSettings; commerce: CommerceSettings;
  announcement: AnnouncementSettings; footer: FooterSettings; productPage: ProductPageSettings;
};

export const IMG = {
  hero: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=80",
  hero2: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
  gym2: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  gym3: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
  run: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
  yoga: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  fold: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  rack: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  gymfloor: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80",
  p1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  p2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  p3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  p4: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  p5: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  p6: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80",
};

export const DEFAULT_SETTINGS: SettingsMap = {
  site: {
    brandName: "MOVA",
    tagline: "Softness that moves with you.",
    logoUrl: "",
    faviconUrl: "",
    email: "hello@mova.in",
    phone: "+91 98765 43210",
    whatsapp: "+919876543210",
    address: "MOVA Lifestyle Pvt. Ltd.\n4th Floor, Koregaon Park Annexe\nPune, Maharashtra 411001",
    businessHours: "Mon–Sat, 10am–7pm IST",
    legalName: "MOVA Lifestyle Pvt. Ltd.",
    gstin: "",
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    pinterest: "https://pinterest.com/",
    youtube: "https://youtube.com/",
    twitter: "",
  },
  seo: {
    defaultTitle: "MOVA — Premium Handkerchiefs & Gym Towels",
    titleTemplate: "%s | MOVA",
    description: "Ultra-soft handkerchiefs, quick-dry gym towels and everyday combo packs. Premium essentials made in India for workouts, travel and everything in between.",
    ogImage: IMG.hero,
    keywords: "handkerchief, gym towel, microfibre towel, cotton hanky, premium essentials India",
  },
  commerce: {
    freeShippingThreshold: 799,
    shippingFee: 79,
    codEnabled: true,
    codFee: 49,
    estimatedDelivery: "Delivered in 3–6 working days across India",
    lowStockThreshold: 10,
  },
  announcement: {
    enabled: true,
    text: "Free shipping on orders over ₹799. Extra 10% off prepaid orders with code PREPAID10.",
    link: "/collection",
  },
  footer: {
    description: "Premium everyday essentials — handkerchiefs and gym towels designed in India to feel soft, dry fast and last long.",
    columns: [
      { title: "Discover", links: [
        { label: "The Collection", url: "/collection" },
        { label: "Gym Mode", url: "/c/gym-towels" },
        { label: "Daily Essentials", url: "/c/handkerchiefs" },
        { label: "Bundled Joy", url: "/c/combo-packs" },
        { label: "New Arrivals", url: "/collection?filter=new" },
      ] },
      { title: "The Brand", links: [
        { label: "Our Story", url: "/our-story" },
        { label: "FAQs", url: "/faqs" },
        { label: "Reviews", url: "/#caught-in-the-wild" },
        { label: "Shipping", url: "/shipping-policy" },
        { label: "Returns", url: "/return-policy" },
      ] },
      { title: "Help", links: [
        { label: "Hello There", url: "/hello-there" },
        { label: "Track Order", url: "/track" },
        { label: "Privacy Policy", url: "/privacy-policy" },
        { label: "Terms & Conditions", url: "/terms" },
        { label: "Refund Policy", url: "/refund-policy" },
      ] },
    ],
    copyright: "© {year} {brand}. All rights reserved.",
    paymentIcons: [{ name: "UPI" }, { name: "Visa" }, { name: "Mastercard" }, { name: "RuPay" }, { name: "NetBanking" }, { name: "COD" }],
    bottomNote: "Designed in India. Made to be used every day.",
  },
  productPage: {
    shippingInfo: "Free shipping on orders over ₹799. Orders ship within 24 hours and arrive in 3–6 working days. Cash on Delivery available across India.",
    returnInfo: "Not in love? Return unused items in original packaging within 7 days for a full refund or exchange. Hygiene products opened from sealed packs cannot be returned.",
    trustBadges: [{ text: "Free shipping over ₹799" }, { text: "7-day easy returns" }, { text: "Secure UPI & card payments" }],
  },
};

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SettingsMap)[];
