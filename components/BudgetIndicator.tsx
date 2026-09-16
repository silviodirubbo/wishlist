import { formatNumber } from "@/lib/format";

const DOT_COUNT = 7;

type BudgetIndicatorProps = {
  year: number;
  spent: number;
  total: number;
  currency: string;
  onClick: () => void;
};

export function BudgetIndicator({
  year,
  spent,
  total,
  currency,
  onClick,
}: BudgetIndicatorProps) {
  const ratio = total > 0 ? Math.min(spent / total, 1) : 0;
  const filledDots = Math.round(ratio * DOT_COUNT);

  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 text-[13px] text-mocha"
    >
      <span>{year}</span>
      <div className="flex gap-1">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-[7px] w-[7px] rounded-full ${
              i < filledDots ? "bg-sienna" : "bg-sand"
            }`}
          />
        ))}
      </div>
      <span className="font-serif font-medium text-[14px] text-ink">
        {currency} {formatNumber(spent)} / {formatNumber(total)}
      </span>
    </button>
  );
}
