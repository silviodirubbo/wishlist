"use client";

import { useMemo } from "react";
import { useMasonry } from "@/hooks/useMasonry";
import type { Item } from "@/lib/types";
import { AddItemTile } from "./AddItemTile";
import { ItemTile } from "./ItemTile";

const ADD_TILE_ID = "__add-tile__";

type MoodboardBoardProps = {
  items: Item[];
  onItemClick: (item: Item) => void;
  onToggleBought: (item: Item) => void;
  onAddItem: () => void;
};

export function MoodboardBoard({
  items,
  onItemClick,
  onToggleBought,
  onAddItem,
}: MoodboardBoardProps) {
  const layoutItems = useMemo(
    () => [...items.map((item) => ({ id: item.id })), { id: ADD_TILE_ID }],
    [items]
  );

  const { containerRef, setTileRef, getTileStyle, containerHeight } = useMasonry(layoutItems);

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
        {items.map((item) => (
          <div key={item.id} ref={setTileRef(item.id)} style={getTileStyle(item.id)}>
            <ItemTile
              item={item}
              onClick={() => onItemClick(item)}
              onToggleBought={() => onToggleBought(item)}
            />
          </div>
        ))}
        <div ref={setTileRef(ADD_TILE_ID)} style={getTileStyle(ADD_TILE_ID)}>
          <AddItemTile onClick={onAddItem} />
        </div>
      </div>
    </div>
  );
}
