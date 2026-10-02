"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FilterChips } from "@/components/FilterChips";
import { MoodboardBoard } from "@/components/MoodboardBoard";
import { shuffledIds } from "@/lib/shuffle";
import type { Item, SharedItem } from "@/lib/types";

type SharedWishlistClientProps = {
  title: string | null;
  items: SharedItem[];
};

// The public payload deliberately omits private fields; fill them with
// neutral values so the shared board can reuse the same tile components.
function toItem(item: SharedItem): Item {
  return {
    ...item,
    user_id: "",
    status: "wanted",
    bought_at: null,
    notes: null,
    created_at: "",
  };
}

export function SharedWishlistClient({ title, items: sharedItems }: SharedWishlistClientProps) {
  const items = useMemo(() => sharedItems.map(toItem), [sharedItems]);
  const [activeChip, setActiveChip] = useState("All");
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[])),
    [items]
  );
  const chips = categories.length > 1 ? ["All", ...categories] : [];

  const filtered = useMemo(
    () => (activeChip === "All" ? items : items.filter((i) => i.category === activeChip)),
    [items, activeChip]
  );

  const displayItems = useMemo(() => {
    if (!shuffledOrder) return filtered;
    const orderIndex = new Map(shuffledOrder.map((id, i) => [id, i]));
    return [...filtered].sort(
      (a, b) => (orderIndex.get(a.id) ?? -1) - (orderIndex.get(b.id) ?? -1)
    );
  }, [filtered, shuffledOrder]);

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

  function handleItemClick(item: Item) {
    if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 py-5 sm:px-12 sm:py-7">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <Image src="/wishlist-mark.svg" alt="" width={30} height={30} />
            <div className="font-serif text-[20px] font-medium tracking-[-0.01em] sm:text-[22px]">
              wishlist<span className="text-sienna">.</span>
            </div>
          </div>
          <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] sm:text-[36px]">
            {title || "A wishlist"}
          </h1>
        </div>
        <p className="text-sm text-mocha">
          {items.length} {items.length === 1 ? "item" : "items"} · tap an item to open it
        </p>
      </div>

      {chips.length > 0 ? (
        <FilterChips
          chips={chips}
          active={activeChip}
          onSelect={setActiveChip}
          onShuffle={handleShuffle}
        />
      ) : (
        <div className="pb-4" />
      )}

      {items.length === 0 ? (
        <p className="mx-auto max-w-[1400px] px-4 pb-20 text-sm text-mocha sm:px-12">
          Nothing on this list yet.
        </p>
      ) : (
        <MoodboardBoard items={displayItems} onItemClick={handleItemClick} />
      )}
    </div>
  );
}
