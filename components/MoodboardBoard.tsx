import type { Item } from "@/lib/types";
import { AddItemTile } from "./AddItemTile";
import { ItemTile } from "./ItemTile";

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
  return (
    <div className="mx-auto max-w-[1400px] columns-[4_260px] gap-x-5 px-12 pb-20">
      {items.map((item) => (
        <ItemTile
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
          onToggleBought={() => onToggleBought(item)}
        />
      ))}
      <AddItemTile onClick={onAddItem} />
    </div>
  );
}
