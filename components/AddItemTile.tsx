type AddItemTileProps = {
  onClick: () => void;
};

export function AddItemTile({ onClick }: AddItemTileProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-sand text-[13px] text-mocha transition-colors hover:border-sienna hover:text-sienna"
    >
      <span className="text-[22px] font-light">+</span>
      <span>Paste a link to add</span>
    </button>
  );
}
