"use client";

import { useMemo, useState } from "react";
import { toggleItemBoughtAction } from "@/app/actions/items";
import { AddItemModal } from "@/components/AddItemModal";
import { BudgetSettingsModal } from "@/components/BudgetSettingsModal";
import { EditItemModal } from "@/components/EditItemModal";
import { FilterChips } from "@/components/FilterChips";
import { MoodboardBoard } from "@/components/MoodboardBoard";
import { TopBar } from "@/components/TopBar";
import type { Item } from "@/lib/types";

const STATUS_CHIPS = ["All", "Wanted", "Bought"];
const KNOWN_CATEGORIES = ["Home", "Tech", "Wine & cellar", "Wardrobe"];

type DashboardClientProps = {
  initialItems: Item[];
  year: number;
  budgetAmount: number;
  budgetCurrency: string;
};

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; item: Item }
  | { mode: "budget" }
  | null;

export function DashboardClient({
  initialItems,
  year,
  budgetAmount: initialBudgetAmount,
  budgetCurrency: initialBudgetCurrency,
}: DashboardClientProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [activeChip, setActiveChip] = useState("All");
  const [modal, setModal] = useState<ModalState>(null);
  const [budgetAmount, setBudgetAmount] = useState(initialBudgetAmount);
  const [budgetCurrency, setBudgetCurrency] = useState(initialBudgetCurrency);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set([
          ...KNOWN_CATEGORIES,
          ...(items.map((item) => item.category).filter(Boolean) as string[]),
        ])
      ),
    [items]
  );

  const chips = [...STATUS_CHIPS, ...categories.filter((c) =>
    items.some((item) => item.category === c)
  )];

  const filteredItems = useMemo(() => {
    if (activeChip === "All") return items;
    if (activeChip === "Wanted") return items.filter((i) => i.status === "wanted");
    if (activeChip === "Bought") return items.filter((i) => i.status === "bought");
    return items.filter((i) => i.category === activeChip);
  }, [items, activeChip]);

  const displayItems = useMemo(() => {
    if (!shuffledOrder) return filteredItems;
    const orderIndex = new Map(shuffledOrder.map((id, i) => [id, i]));
    return [...filteredItems].sort(
      (a, b) => (orderIndex.get(a.id) ?? Infinity) - (orderIndex.get(b.id) ?? Infinity)
    );
  }, [filteredItems, shuffledOrder]);

  function handleShuffle() {
    const ids = filteredItems.map((item) => item.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrder(ids);
  }

  const spent = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.status === "bought" &&
            i.bought_at &&
            new Date(i.bought_at).getFullYear() === year
        )
        .reduce((sum, i) => sum + (i.price ?? 0), 0),
    [items, year]
  );

  async function handleToggleBought(item: Item) {
    const previous = items;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: i.status === "bought" ? "wanted" : "bought",
              bought_at:
                i.status === "bought" ? null : new Date().toISOString().slice(0, 10),
            }
          : i
      )
    );

    try {
      await toggleItemBoughtAction(item.id, item.status);
    } catch {
      setItems(previous);
    }
  }

  function handleCreated(item: Item) {
    setItems((prev) => [item, ...prev]);
  }

  function handleUpdated(item: Item) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <TopBar
        year={year}
        spent={spent}
        total={budgetAmount}
        currency={budgetCurrency}
        onAddItem={() => setModal({ mode: "add" })}
        onOpenBudgetSettings={() => setModal({ mode: "budget" })}
      />
      <FilterChips
        chips={chips}
        active={activeChip}
        onSelect={setActiveChip}
        onShuffle={handleShuffle}
      />
      <MoodboardBoard
        items={displayItems}
        onItemClick={(item) => setModal({ mode: "edit", item })}
        onToggleBought={handleToggleBought}
        onAddItem={() => setModal({ mode: "add" })}
      />

      {modal?.mode === "add" && (
        <AddItemModal
          categories={categories}
          onClose={() => setModal(null)}
          onCreated={handleCreated}
        />
      )}

      {modal?.mode === "edit" && (
        <EditItemModal
          item={modal.item}
          categories={categories}
          onClose={() => setModal(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}

      {modal?.mode === "budget" && (
        <BudgetSettingsModal
          year={year}
          amount={budgetAmount}
          currency={budgetCurrency}
          onClose={() => setModal(null)}
          onSaved={(amount, currency) => {
            setBudgetAmount(amount);
            setBudgetCurrency(currency);
          }}
        />
      )}
    </div>
  );
}
