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
    <div
      ref={containerRef}
      className="relative mx-auto max-w-[1400px] px-12 pb-20"
      style={{ height: containerHeight }}
    >
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
  );
}
