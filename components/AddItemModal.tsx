"use client";

import { useState } from "react";
import type { ItemInput } from "@/app/actions/items";
import { createItemAction } from "@/app/actions/items";
import { ItemForm } from "@/components/ItemForm";
import { Modal } from "@/components/Modal";
import type { Item } from "@/lib/types";

type AddItemModalProps = {
  categories: string[];
  onClose: () => void;
  onCreated: (item: Item) => void;
};

export function AddItemModal({ categories, onClose, onCreated }: AddItemModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: ItemInput) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createItemAction(values);
      onCreated(created as Item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-6 font-serif text-xl font-medium">Add item</h2>
      <ItemForm
        categories={categories}
        submitLabel="Add to wishlist"
        submitting={submitting}
        onSubmit={handleSubmit}
      />
      {error && <p className="mt-3 text-sm text-sienna">{error}</p>}
    </Modal>
  );
}
