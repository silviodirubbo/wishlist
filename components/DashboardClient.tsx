"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { toggleItemBoughtAction } from "@/app/actions/items";
import { AddItemModal } from "@/components/AddItemModal";
import { BudgetSettingsModal } from "@/components/BudgetSettingsModal";
import { EditItemModal } from "@/components/EditItemModal";
import { FilterChips } from "@/components/FilterChips";
import { MoodboardBoard } from "@/components/MoodboardBoard";
import { ShareModal } from "@/components/ShareModal";
import { TopBar } from "@/components/TopBar";
import { shuffledIds } from "@/lib/shuffle";
import type { Item, ShareLink } from "@/lib/types";

const STATUS_CHIPS = ["All", "Wanted", "Bought"];
const KNOWN_CATEGORIES = ["Home", "Tech", "Wine & cellar", "Wardrobe"];

type DashboardClientProps = {
  initialItems: Item[];
  year: number;
  budgetAmount: number;
  budgetCurrency: string;
  initialShare: ShareLink | null;
};

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; item: Item }
  | { mode: "budget" }
  | { mode: "share" }
  | null;

export function DashboardClient({
  initialItems,
  year,
  budgetAmount: initialBudgetAmount,
  budgetCurrency: initialBudgetCurrency,
  initialShare,
}: DashboardClientProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [activeChip, setActiveChip] = useState("All");
  const [modal, setModal] = useState<ModalState>(null);
  const [budgetAmount, setBudgetAmount] = useState(initialBudgetAmount);
  const [budgetCurrency, setBudgetCurrency] = useState(initialBudgetCurrency);
  const [share, setShare] = useState<ShareLink | null>(initialShare);
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
      (a, b) => (orderIndex.get(a.id) ?? -1) - (orderIndex.get(b.id) ?? -1)
    );
  }, [filteredItems, shuffledOrder]);

  function handleShuffle() {
    setShuffledOrder(shuffledIds(items));
  }

  // Shuffle on every open, before the first paint. Items not in the order
  // (e.g. just added) sort to the top.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffledOrder(shuffledIds(items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onShare={() => setModal({ mode: "share" })}
        isShared={!!share?.enabled}
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

      {modal?.mode === "share" && (
        <ShareModal share={share} onChange={setShare} onClose={() => setModal(null)} />
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
