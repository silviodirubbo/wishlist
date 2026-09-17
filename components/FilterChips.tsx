import { ShuffleButton } from "./ShuffleButton";

type FilterChipsProps = {
  chips: string[];
  active: string;
  onSelect: (chip: string) => void;
  onShuffle: () => void;
};

export function FilterChips({ chips, active, onSelect, onShuffle }: FilterChipsProps) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-12 pb-7">
      {chips.map((chip, index) => {
        const isActive = chip === active;
        return (
          <span key={chip} className="contents">
            <button
              onClick={() => onSelect(chip)}
              className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-[7px] text-[13px] transition-colors ${
                isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-sand text-mocha hover:border-mocha"
              }`}
            >
              {chip}
            </button>
            {index === 0 && <ShuffleButton onClick={onShuffle} />}
          </span>
        );
      })}
    </div>
  );
}
