"use client";

import { useState } from "react";
import type { ItemInput } from "@/app/actions/items";
import { deleteItemAction, setItemStatusAction, updateItemAction } from "@/app/actions/items";
import { ItemForm } from "@/components/ItemForm";
import { Modal } from "@/components/Modal";
import type { Item, ItemStatus } from "@/lib/types";

type EditItemModalProps = {
  item: Item;
  categories: string[];
  onClose: () => void;
  onUpdated: (item: Item) => void;
  onDeleted: (id: string) => void;
};

export function EditItemModal({
  item,
  categories,
  onClose,
  onUpdated,
  onDeleted,
}: EditItemModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ItemStatus>(item.status);

  async function handleSubmit(values: ItemInput) {
    setSubmitting(true);
    setError(null);
    try {
      if (status !== item.status) {
        await setItemStatusAction(item.id, status);
      }
      const updated = await updateItemAction(item.id, values);
      onUpdated({ ...(updated as Item), status });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteItemAction(item.id);
      onDeleted(item.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-6 font-serif text-xl font-medium">Edit item</h2>

      <div className="mb-4 flex gap-2">
        {(["wanted", "bought"] as ItemStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`cursor-pointer rounded-full border px-4 py-[7px] text-[13px] capitalize transition-colors ${
              status === s
                ? s === "bought"
                  ? "border-moss bg-moss text-white"
                  : "border-sienna bg-sienna text-white"
                : "border-sand text-mocha hover:border-mocha"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ItemForm
        initialValues={item}
        categories={categories}
        submitLabel="Save changes"
        submitting={submitting}
        onSubmit={handleSubmit}
        footer={
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="cursor-pointer self-start text-sm text-sienna hover:underline disabled:opacity-60"
          >
            Delete item
          </button>
        }
      />
      {error && <p className="mt-3 text-sm text-sienna">{error}</p>}
    </Modal>
  );
}
