"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { upsertBudgetAction } from "@/app/actions/budget";
import { Modal } from "@/components/Modal";

const CURRENCIES = ["CHF", "EUR", "USD"];

type BudgetSettingsModalProps = {
  year: number;
  amount: number;
  currency: string;
  onClose: () => void;
  onSaved: (amount: number, currency: string) => void;
};

export function BudgetSettingsModal({
  year,
  amount,
  currency,
  onClose,
  onSaved,
}: BudgetSettingsModalProps) {
  const [value, setValue] = useState(amount > 0 ? amount.toString() : "");
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amountNumber = Number(value);
    if (!Number.isFinite(amountNumber) || amountNumber < 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await upsertBudgetAction(year, amountNumber, selectedCurrency);
      onSaved(amountNumber, selectedCurrency);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-6 font-serif text-xl font-medium">{year} budget</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label className="text-xs text-mocha">Amount</label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="5000"
              className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-mocha">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-sienna">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-sienna disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save budget"}
        </button>
      </form>
    </Modal>
  );
}
