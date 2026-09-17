import Image from "next/image";
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
    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-5 sm:flex-nowrap sm:gap-x-7 sm:px-12 sm:py-7">
      <div className="flex items-center gap-2.5">
        <Image src="/wishlist-mark.svg" alt="" width={30} height={30} />
        <div className="font-serif text-[20px] font-medium tracking-[-0.01em] sm:text-[22px]">
          wishlist<span className="text-sienna">.</span>
        </div>
      </div>
      <button
        onClick={onAddItem}
        className="order-2 ml-auto shrink-0 cursor-pointer rounded-full bg-ink px-4 py-[10px] text-sm font-medium whitespace-nowrap text-paper transition-colors hover:bg-sienna sm:order-3 sm:ml-0 sm:px-5 sm:py-[11px]"
      >
        + Add item
      </button>
      <div className="order-3 w-full sm:order-2 sm:ml-auto sm:w-auto">
        <BudgetIndicator
          year={year}
          spent={spent}
          total={total}
          currency={currency}
          onClick={onOpenBudgetSettings}
        />
      </div>
    </div>
  );
}
