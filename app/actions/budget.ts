"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertBudgetAction(year: number, amount: number, currency: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budget")
    .upsert({ year, amount, currency }, { onConflict: "user_id,year" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}
