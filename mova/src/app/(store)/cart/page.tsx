import { CartView } from "@/components/store/CartView";
import { getNav } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const nav = await getNav().catch(() => []);
  return { ...(await buildMetadata({ title: nav.find((n) => n.url === "/cart")?.label ?? "Your Bag", path: "/cart" })), robots: { index: false } };
}

export default async function CartPage() {
  const nav = await getNav().catch(() => []);
  return <CartView title={nav.find((n) => n.url === "/cart")?.label ?? "My Bag"} />;
}
