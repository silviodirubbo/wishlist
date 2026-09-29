import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedWishlistClient } from "@/components/SharedWishlistClient";
import { createClient } from "@/lib/supabase/server";
import type { SharedItem } from "@/lib/types";

// Keep the private token out of search engines and out of Referer headers
// sent to product sites.
export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function SharedWishlistPage(props: PageProps<"/s/[token]">) {
  const { token } = await props.params;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_wishlist", { p_token: token });

  if (error || !data) notFound();

  const shared = data as { title: string | null; items: SharedItem[] };

  return <SharedWishlistClient title={shared.title} items={shared.items} />;
}
