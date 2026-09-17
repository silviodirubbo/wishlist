import type { Item } from "@/lib/types";
import { formatBoughtDate, formatPrice, formatTargetDate } from "@/lib/format";
import { placeholderGradient, placeholderHeightClass } from "@/lib/tile-style";

type ItemTileProps = {
  item: Item;
  onClick: () => void;
  onToggleBought: () => void;
};

export function ItemTile({ item, onClick, onToggleBought }: ItemTileProps) {
  const isBought = item.status === "bought";
  const dateLabel = isBought
    ? formatBoughtDate(item.bought_at)
    : formatTargetDate(item.target_date);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[14px] bg-sand-light transition-transform duration-150 hover:-translate-y-[3px]"
    >
      <div
        className={`w-full bg-cover bg-center ${placeholderHeightClass(item.id)} ${
          isBought ? "saturate-50 brightness-[0.85]" : ""
        }`}
        style={
          item.image_url
            ? { backgroundImage: `url(${item.image_url})` }
            : { background: placeholderGradient(item.id) }
        }
      />

      <div
        className={`tile-overlay absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-[10px] py-[5px] text-[11px] text-white backdrop-blur-[6px] ${
          isBought ? "bg-moss/88" : "bg-sienna/88"
        }`}
      >
        {isBought ? "Bought" : "Wanted"}
      </div>

      {item.priority && (
        <div className="tile-overlay absolute top-3 right-3 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/90 text-[13px] text-sienna">
          &hearts;
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBought();
        }}
        aria-label={isBought ? "Mark as wanted" : "Mark as bought"}
        aria-pressed={isBought}
        className={`absolute bottom-3 right-3 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 text-[13px] transition-colors ${
          isBought
            ? "border-moss/75 bg-moss/75 text-white hover:border-moss hover:bg-moss"
            : "border-moss/50 bg-white/50 text-moss/80 hover:border-moss hover:bg-white hover:text-moss"
        }`}
      >
        {isBought ? "✓" : ""}
      </button>

      <div className="tile-overlay-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent py-4 pr-12 pl-4">
        <div className="mb-1 text-sm font-medium leading-[1.3] text-paper">{item.name}</div>
        <div className="flex items-baseline justify-between text-[12.5px] text-paper/75">
          <span className="font-serif text-[15px] font-medium text-paper">
            {formatPrice(item.price, item.currency)}
          </span>
          <span>{dateLabel}</span>
        </div>
      </div>
    </div>
  );
}
