import { BudgetIndicator } from "./BudgetIndicator";

type TopBarProps = {
  year: number;
  spent: number;
  total: number;
  currency: string;
  onAddItem: () => void;
  onOpenBudgetSettings: () => void;
};

export function TopBar({
  year,
  spent,
  total,
  currency,
  onAddItem,
  onOpenBudgetSettings,
}: TopBarProps) {
  return (
    <div className="mx-auto flex max-w-[1400px] items-center justify-between px-12 py-7">
      <div className="font-serif text-[22px] font-medium tracking-[-0.01em]">
        wishlist<span className="text-sienna">.</span>
      </div>
      <div className="flex items-center gap-7">
        <BudgetIndicator
          year={year}
          spent={spent}
          total={total}
          currency={currency}
          onClick={onOpenBudgetSettings}
        />
        <button
          onClick={onAddItem}
          className="cursor-pointer rounded-full bg-ink px-5 py-[11px] text-sm font-medium text-paper transition-colors hover:bg-sienna"
        >
          + Add item
        </button>
      </div>
    </div>
  );
}
