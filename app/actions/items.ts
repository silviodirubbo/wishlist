"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types";

export type ItemInput = {
  name: string;
  url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  category: string | null;
  priority: boolean;
  target_date: string | null;
  notes: string | null;
};

export async function createItemAction(input: ItemInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .insert({ ...input, status: "wanted" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function updateItemAction(id: string, input: ItemInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function deleteItemAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function toggleItemBoughtAction(id: string, currentStatus: ItemStatus) {
  const supabase = await createClient();
  const nextStatus: ItemStatus = currentStatus === "bought" ? "wanted" : "bought";
  const boughtAt = nextStatus === "bought" ? new Date().toISOString().slice(0, 10) : null;

  const { error } = await supabase
    .from("items")
    .update({ status: nextStatus, bought_at: boughtAt })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return { status: nextStatus, bought_at: boughtAt };
}

export async function setItemStatusAction(id: string, status: ItemStatus) {
  const supabase = await createClient();
  const boughtAt = status === "bought" ? new Date().toISOString().slice(0, 10) : null;

  const { error } = await supabase
    .from("items")
    .update({ status, bought_at: boughtAt })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return { status, bought_at: boughtAt };
}
