import { notFound } from "next/navigation";
import { getSettings } from "@/lib/cms";
import { SETTINGS_SCHEMAS } from "@/lib/schemas";
import type { SettingsMap } from "@/lib/defaults";
import { AdminHeader } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PasswordForm } from "@/components/admin/PasswordForm";

const DESCRIPTIONS: Record<string, string> = {
  site: "Brand name, logo, favicon and the contact details shown across the site.",
  social: "Links used by social icons in the header, footer and contact page. Leave empty to hide an icon.",
  seo: "Default title and description for search engines and link previews. Products, categories and pages have their own SEO fields.",
  commerce: "Shipping charges, Cash on Delivery and stock alerts.",
  announcement: "The thin bar at the very top of every page.",
  footer: "Footer columns and links, description, payment methods and copyright. The Follow column uses your social links.",
  productPage: "Shipping and return information shown on every product page.",
};

export function generateMetadata({ params }: { params: { group: string } }) {
  return { title: SETTINGS_SCHEMAS[params.group]?.name ?? "Account" };
}

export default async function SettingsPage({ params }: { params: { group: string } }) {
  if (params.group === "account") {
    return (<><AdminHeader title="My account" description="Change your admin password." /><PasswordForm /></>);
  }
  const schema = SETTINGS_SCHEMAS[params.group];
  if (!schema) notFound();
  const s = await getSettings();
  const initial = s[params.group as keyof SettingsMap] as unknown as Record<string, unknown>;
  return (
    <>
      <AdminHeader title={schema.name} description={DESCRIPTIONS[params.group]} />
      <SettingsForm key={params.group} group={params.group} fields={schema.fields} initial={initial} />
    </>
  );
}
