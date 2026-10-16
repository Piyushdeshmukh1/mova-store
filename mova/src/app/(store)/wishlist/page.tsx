import { WishlistView } from "@/components/store/WishlistView";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return { ...(await buildMetadata({ title: "Wishlist", path: "/wishlist" })), robots: { index: false } };
}
export default function WishlistPage() { return <WishlistView />; }
