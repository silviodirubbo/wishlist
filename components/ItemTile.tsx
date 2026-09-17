import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Item } from "@/lib/types";
import { formatBoughtDate, formatPrice, formatTargetDate } from "@/lib/format";
import { placeholderGradient, placeholderHeightClass } from "@/lib/tile-style";

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

type ItemTileProps = {
  item: Item;
  revealed: boolean;
  onClick: () => void;
  onToggleReveal: () => void;
  onToggleBought: () => void;
};

export function ItemTile({
  item,
  revealed,
  onClick,
  onToggleReveal,
  onToggleBought,
}: ItemTileProps) {
  const isBought = item.status === "bought";
  const dateLabel = isBought
    ? formatBoughtDate(item.bought_at)
    : formatTargetDate(item.target_date);

  // Touch only: a single tap reveals the overlay (mirrors desktop hover),
  // a long-press opens edit instead of a plain tap. Desktop mouse
  // interaction (pointerType !== "touch") is left to the plain onClick
  // below, completely untouched by any of this.
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "touch") return;
    longPressFiredRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      suppressNextClickRef.current = true;
      onClick();
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "touch" || !startPosRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      clearLongPressTimer();
    }
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "touch") return;
    const hadTimer = longPressTimerRef.current !== null;
    clearLongPressTimer();
    if (hadTimer && !longPressFiredRef.current) {
      suppressNextClickRef.current = true;
      onToggleReveal();
    }
    startPosRef.current = null;
  }

  function handlePointerCancel() {
    clearLongPressTimer();
    startPosRef.current = null;
  }

  // The browser fires a synthetic "ghost click" after every touch
  // interaction; suppressNextClickRef swallows it so tap/long-press don't
  // also trigger this handler a second time. Desktop mouse clicks never
  // set the flag, so they pass straight through.
  function handleClick() {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onClick();
  }

  return (
    <div
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative cursor-pointer overflow-hidden rounded-[14px] bg-sand-light transition-transform duration-150 hover:-translate-y-[3px] ${
        revealed ? "is-revealed" : ""
      }`}
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
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={isBought ? "Mark as wanted" : "Mark as bought"}
        aria-pressed={isBought}
        className="group/checkbox absolute right-0 bottom-0 flex h-11 w-11 cursor-pointer items-center justify-center"
      >
        <span
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 text-[13px] transition-colors ${
            isBought
              ? "border-moss/75 bg-moss/75 text-white group-hover/checkbox:border-moss group-hover/checkbox:bg-moss"
              : "border-moss/50 bg-white/50 text-moss/80 group-hover/checkbox:border-moss group-hover/checkbox:bg-white group-hover/checkbox:text-moss"
          }`}
        >
          {isBought ? "✓" : ""}
        </span>
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
