"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ShareLink } from "@/lib/types";

const SELECT = "token, enabled, title";

function newToken() {
  return randomBytes(24).toString("base64url");
}

export async function enableShareAction(): Promise<ShareLink> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("share_links")
    .select(SELECT)
    .maybeSingle();

  if (existing) {
    if (existing.enabled) return existing as ShareLink;
    const { data, error } = await supabase
      .from("share_links")
      .update({ enabled: true })
      .eq("token", existing.token)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return data as ShareLink;
  }

  const { data, error } = await supabase
    .from("share_links")
    .insert({ token: newToken() })
    .select(SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as ShareLink;
}

export async function disableShareAction(): Promise<ShareLink | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("share_links")
    .update({ enabled: false })
    .not("token", "is", null)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  return (data as ShareLink | null) ?? null;
}

// Issues a brand-new token, which immediately invalidates the old URL.
export async function regenerateShareAction(): Promise<ShareLink> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("share_links")
    .update({ token: newToken(), enabled: true })
    .not("token", "is", null)
    .select(SELECT)
    .single();
  if (error) throw new Error(error.message);

  return data as ShareLink;
}

export async function updateShareTitleAction(title: string): Promise<ShareLink> {
  const supabase = await createClient();
  const trimmed = title.trim().slice(0, 80);

  const { data, error } = await supabase
    .from("share_links")
    .update({ title: trimmed || null })
    .not("token", "is", null)
    .select(SELECT)
    .single();
  if (error) throw new Error(error.message);

  return data as ShareLink;
}
