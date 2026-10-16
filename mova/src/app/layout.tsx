import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import { getSettings } from "@/lib/cms";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

// Fonts are self-hosted from npm (no build-time call to Google Fonts).

export const viewport: Viewport = { themeColor: "#123C35", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const { site, seo } = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.description,
    applicationName: site.brandName,
    icons: site.faviconUrl ? { icon: site.faviconUrl, apple: site.faviconUrl } : { icon: "/favicon.svg" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
