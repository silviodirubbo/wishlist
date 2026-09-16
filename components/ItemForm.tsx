"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { ItemInput } from "@/app/actions/items";
import { suggestCategory } from "@/lib/category-rules";

const CURRENCIES = ["CHF", "EUR", "USD"];

type ItemFormProps = {
  initialValues?: Partial<ItemInput>;
  categories: string[];
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: ItemInput) => void;
  footer?: React.ReactNode;
};

export function ItemForm({
  initialValues,
  categories,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: ItemFormProps) {
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [price, setPrice] = useState(initialValues?.price?.toString() ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "CHF");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [categoryTouched, setCategoryTouched] = useState(Boolean(initialValues?.category));
  const [priority, setPriority] = useState(initialValues?.priority ?? false);
  const [targetDate, setTargetDate] = useState(initialValues?.target_date ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "");
  const [fetching, setFetching] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  function maybeAutoSuggestCategory(nextName: string, nextUrl: string) {
    if (categoryTouched) return;
    const suggestion = suggestCategory(nextName, nextUrl);
    if (suggestion) setCategory(suggestion);
  }

  async function handleFetchDetails() {
    if (!url.trim()) return;
    setFetching(true);
    setFetchNotice(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFetchNotice(data.error ?? "Couldn't fetch details from that link.");
        return;
      }

      if (data.name && !name) setName(data.name);
      if (data.image_url && !imageUrl) setImageUrl(data.image_url);
      if (data.price !== null && data.price !== undefined && price === "") {
        setPrice(String(data.price));
      }
      if (data.currency) setCurrency(data.currency);
      maybeAutoSuggestCategory(data.name ?? name, url);

      if (data.warning) setFetchNotice(data.warning);
      if (!data.name && !data.image_url && data.price === null && !data.warning) {
        setFetchNotice("Couldn't find product details on that page — fill in the fields manually.");
      }
    } catch {
      setFetchNotice("Couldn't fetch details from that link. Fill in the fields manually.");
    } finally {
      setFetching(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      url: url.trim() || null,
      image_url: imageUrl.trim() || null,
      price: price === "" ? null : Number(price),
      currency,
      category: category.trim() || null,
      priority,
      target_date: targetDate || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-mocha">Product link</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              maybeAutoSuggestCategory(name, e.target.value);
            }}
            placeholder="https://…"
            className="flex-1 rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
          />
          <button
            type="button"
            onClick={handleFetchDetails}
            disabled={!url.trim() || fetching}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-sand px-3 py-2 text-sm text-mocha transition-colors hover:border-sienna hover:text-sienna disabled:cursor-default disabled:opacity-50"
          >
            {fetching ? "Fetching…" : "Fetch details"}
          </button>
        </div>
        {fetchNotice && <p className="text-xs text-mocha">{fetchNotice}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-mocha">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            maybeAutoSuggestCategory(e.target.value, url);
          }}
          placeholder="Item name"
          className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-mocha">Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-mocha">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
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

      <div className="flex flex-col gap-1">
        <label className="text-xs text-mocha">Category</label>
        <input
          type="text"
          list="category-options"
          value={category}
          onChange={(e) => {
            setCategoryTouched(true);
            setCategory(e.target.value);
          }}
          placeholder="e.g. Home"
          className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-mocha">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-mocha">Buy by</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="accent-sienna"
          />
          Priority
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-mocha">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none rounded-lg border border-sand bg-transparent px-3 py-2 text-sm outline-none focus:border-sienna"
        />
      </div>

      {footer}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-sienna disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
