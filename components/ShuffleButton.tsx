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
      className="ml-auto flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-moss text-paper transition-colors hover:bg-sienna"
    >
      <Shuffle size={14} />
    </button>
  );
}
