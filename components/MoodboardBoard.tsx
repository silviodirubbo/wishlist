"use client";

import { useEffect, useMemo, useState } from "react";
import { useMasonry } from "@/hooks/useMasonry";
import type { Item } from "@/lib/types";
import { AddItemTile } from "./AddItemTile";
import { ItemTile } from "./ItemTile";

const ADD_TILE_ID = "__add-tile__";

type MoodboardBoardProps = {
  items: Item[];
  onItemClick: (item: Item) => void;
  // Omit both to render a read-only board (public share page).
  onToggleBought?: (item: Item) => void;
  onAddItem?: () => void;
};

export function MoodboardBoard({
  items,
  onItemClick,
  onToggleBought,
  onAddItem,
}: MoodboardBoardProps) {
  const layoutItems = useMemo(
    () => [
      ...items.map((item) => ({ id: item.id })),
      ...(onAddItem ? [{ id: ADD_TILE_ID }] : []),
    ],
    [items, onAddItem]
  );

  const { containerRef, setTileRef, getTileStyle, containerHeight } = useMasonry(layoutItems);

  // Touch-only tap-to-reveal state: only one tile shows its overlay at a
  // time, and tapping outside every tile (or another tile) dismisses it.
  const [revealedId, setRevealedId] = useState<string | null>(null);

  // Tiles below the fold are lazy at first so the page opens fast. Once the
  // page has settled, load every image in the background so a shuffle shows
  // finished pictures instead of tiles that are still downloading.
  const [loadAll, setLoadAll] = useState(false);
  useEffect(() => {
    const start = () => setLoadAll(true);
    if (document.readyState === "complete") {
      const t = setTimeout(start, 800);
      return () => clearTimeout(t);
    }
    let t: ReturnType<typeof setTimeout>;
    const onLoad = () => {
      t = setTimeout(start, 800);
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!revealedId) return;

    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-tile-id]")) return;
      setRevealedId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [revealedId]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-12">
      {/*
       * This inner div (not the padded wrapper above) is what useMasonry
       * measures and positions tiles against — absolutely positioned
       * children use their positioned ancestor's *padding box* as their
       * containing block, so padding on the same element a tile is
       * absolutely positioned within is silently ignored. Padding has to
       * live one level up instead.
       */}
      <div ref={containerRef} className="relative" style={{ height: containerHeight }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={setTileRef(item.id)}
            style={getTileStyle(item.id)}
            data-tile-id={item.id}
          >
            <ItemTile
              item={item}
              revealed={revealedId === item.id}
              priority={index < 8}
              eager={loadAll}
              onClick={() => onItemClick(item)}
              onToggleReveal={() =>
                setRevealedId((current) => (current === item.id ? null : item.id))
              }
              onToggleBought={onToggleBought ? () => onToggleBought(item) : undefined}
            />
          </div>
        ))}
        {onAddItem && (
          <div ref={setTileRef(ADD_TILE_ID)} style={getTileStyle(ADD_TILE_ID)}>
            <AddItemTile onClick={onAddItem} />
          </div>
        )}
      </div>
    </div>
  );
}
