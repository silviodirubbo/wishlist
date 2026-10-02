"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "prompt" | "ios";

export function InstallAppButton() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIos) {
      // Safari has no install event; show instructions instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("ios");
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("prompt");
    }
    function onInstalled() {
      setDeferred(null);
      setMode("hidden");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  async function handleClick() {
    if (mode === "ios") {
      setShowIosHint((v) => !v);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setMode("hidden");
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        aria-label="Install Wishlist as an app"
        title="Install app"
        className="cursor-pointer rounded-full border border-sienna bg-sienna px-4 py-[9px] text-sm font-medium whitespace-nowrap text-white transition-colors hover:border-ink hover:bg-ink sm:px-5 sm:py-[10px]"
      >
        App
      </button>
      {showIosHint && (
        <div
          role="dialog"
          className="absolute top-full right-0 z-50 mt-2 w-64 rounded-[14px] border border-sand bg-paper p-4 text-[13px] leading-[1.45] text-ink shadow-lg"
        >
          To install: tap the Share icon in Safari, then choose{" "}
          <strong className="font-medium">Add to Home Screen</strong>.
          <button
            onClick={() => setShowIosHint(false)}
            className="mt-3 block cursor-pointer text-sienna"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
