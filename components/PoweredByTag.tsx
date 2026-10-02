import Image from "next/image";

export function PoweredByTag() {
  return (
    <a
      href="https://silviodirubbo.github.io"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 py-6 text-[11px] text-mocha opacity-70 transition-opacity hover:opacity-100"
    >
      <Image src="/sdr-mark.svg" alt="" width={16} height={16} />
      <span>powered by silviodirubbo.github.io</span>
    </a>
  );
}
