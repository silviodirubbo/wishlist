"use client";

import { useState } from "react";
import {
  disableShareAction,
  enableShareAction,
  regenerateShareAction,
  updateShareTitleAction,
} from "@/app/actions/share";
import { Modal } from "@/components/Modal";
import type { ShareLink } from "@/lib/types";

type ShareModalProps = {
  share: ShareLink | null;
  onChange: (share: ShareLink | null) => void;
  onClose: () => void;
};

export function ShareModal({ share, onChange, onClose }: ShareModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState(share?.title ?? "");
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const active = share?.enabled ? share : null;
  const url = active ? `${window.location.origin}/s/${active.token}` : "";

  async function run(fn: () => Promise<ShareLink | null>) {
    setBusy(true);
    setError(null);
    try {
      onChange(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy automatically. Select the link and copy it.");
    }
  }

  const titleDirty = (share?.title ?? "") !== title.trim();

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-1 font-serif text-[22px] font-medium">Share your wishlist</h2>
      <p className="mb-5 text-sm text-mocha">
        Anyone with the link can browse the items you still want. Bought items, notes and your
        budget stay private.
      </p>

      {!active ? (
        <button
          onClick={() => run(enableShareAction)}
          disabled={busy}
          className="w-full cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-sienna disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create share link"}
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-full border border-sand bg-transparent px-4 py-2.5 text-sm text-ink outline-none"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-sienna"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] text-mocha" htmlFor="share-title">
              Title shown on the page (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="share-title"
                value={title}
                maxLength={80}
                placeholder="e.g. Silvio's wishlist"
                onChange={(e) => setTitle(e.target.value)}
                className="min-w-0 flex-1 rounded-full border border-sand bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-sienna"
              />
              <button
                onClick={() => run(() => updateShareTitleAction(title))}
                disabled={busy || !titleDirty}
                className="shrink-0 cursor-pointer rounded-full border border-sand px-5 py-2.5 text-sm text-ink transition-colors hover:border-mocha disabled:cursor-default disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand pt-4 text-[13px]">
            {confirmRegenerate ? (
              <>
                <span className="text-mocha">The current link will stop working.</span>
                <button
                  onClick={() =>
                    run(async () => {
                      const next = await regenerateShareAction();
                      setConfirmRegenerate(false);
                      return next;
                    })
                  }
                  disabled={busy}
                  className="cursor-pointer text-sienna underline underline-offset-2"
                >
                  Confirm new link
                </button>
                <button
                  onClick={() => setConfirmRegenerate(false)}
                  className="cursor-pointer text-mocha underline underline-offset-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setConfirmRegenerate(true)}
                  className="cursor-pointer text-mocha underline underline-offset-2 hover:text-ink"
                >
                  Generate a new link
                </button>
                <button
                  onClick={() => run(disableShareAction)}
                  disabled={busy}
                  className="cursor-pointer text-sienna underline underline-offset-2"
                >
                  Stop sharing
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-sienna">{error}</p>}
    </Modal>
  );
}
