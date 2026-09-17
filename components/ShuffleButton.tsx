import { Shuffle } from "lucide-react";

type ShuffleButtonProps = {
  onClick: () => void;
};

export function ShuffleButton({ onClick }: ShuffleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Shuffle order"
      title="Shuffle order"
      className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-sand text-mocha transition-colors hover:border-sienna hover:text-sienna"
    >
      <Shuffle size={14} />
    </button>
  );
}
