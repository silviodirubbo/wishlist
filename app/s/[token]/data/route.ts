import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SharedItem } from "@/lib/types";

// Machine-readable twin of the public share page, used by the weekly price
// check. Same token gate and same safe subset of columns as the page itself
// (see get_shared_wishlist), plus a ready-made `priority_items` list.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_wishlist", { p_token: token });

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shared = data as { title: string | null; items: SharedItem[] };
  return NextResponse.json(
    {
      title: shared.title,
      count: shared.items.length,
      priority_count: shared.items.filter((i) => i.priority).length,
      priority_items: shared.items.filter((i) => i.priority),
      items: shared.items,
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }
  );
}
