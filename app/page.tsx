import { DashboardClient } from "@/components/DashboardClient";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const [{ data: items }, { data: budget }] = await Promise.all([
    supabase.from("items").select("*").order("created_at", { ascending: false }),
    supabase.from("budget").select("*").eq("year", year).maybeSingle(),
  ]);

  return (
    <DashboardClient
      initialItems={(items ?? []) as Item[]}
      year={year}
      budgetAmount={budget?.amount ?? 0}
      budgetCurrency={budget?.currency ?? "CHF"}
    />
  );
}
