import { ShuffleButton } from "./ShuffleButton";

type FilterChipsProps = {
  chips: string[];
  active: string;
  onSelect: (chip: string) => void;
  onShuffle: () => void;
};

export function FilterChips({ chips, active, onSelect, onShuffle }: FilterChipsProps) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 pb-7 sm:px-12">
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <button
            key={chip}
            onClick={() => onSelect(chip)}
            className={`cursor-pointer touch-manipulation rounded-full border px-4 py-[10px] text-[13px] whitespace-nowrap transition-colors sm:py-[7px] ${
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-sand text-mocha hover:border-mocha"
            }`}
          >
            {chip}
          </button>
        );
      })}
      <ShuffleButton onClick={onShuffle} />
    </div>
  );
}
