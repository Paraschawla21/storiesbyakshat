"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";

interface PhilosophyItemData {
  id: string;
  title: string;
  body: string;
  order: number;
}

export default function PhilosophyManager({
  initialItems,
}: {
  initialItems: PhilosophyItemData[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function updateItem(id: string, patch: Partial<PhilosophyItemData>) {
    const previous = items;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    try {
      const res = await fetch(`/api/admin/philosophy/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save change."));
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Failed to save change.");
    }
  }

  async function persistOrder(nextItems: PhilosophyItemData[]) {
    try {
      const res = await fetch("/api/admin/philosophy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: nextItems.map((item, i) => ({ id: item.id, order: i })),
        }),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save new order."));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save new order.");
    }
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      persistOrder(next);
      return next;
    });
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this philosophy item? This cannot be undone.")) return;
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/admin/philosophy/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to delete item."));
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Failed to delete item.");
    }
  }

  async function addItem() {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/philosophy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New point", body: "" }),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to add item."));
      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mt-10">
      <h2 className="mb-4 font-display text-xl text-ink">Philosophy Items</h2>

      {error && <p className="mb-2 text-sm text-rosewood">{error}</p>}

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-paper p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Title"
                  defaultValue={item.title}
                  onBlur={(e) => updateItem(item.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm font-medium"
                />
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(i, 1)}
                  disabled={i === items.length - 1}
                  className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="rounded px-2 py-1 text-xs text-rosewood hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              placeholder="Body"
              defaultValue={item.body}
              onBlur={(e) => updateItem(item.id, { body: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm"
              rows={2}
            />
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-ink-soft">No philosophy items yet.</p>
        )}
      </div>

      <button
        onClick={addItem}
        disabled={adding}
        className="mt-4 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-marigold hover:text-marigold-dark disabled:opacity-50"
      >
        {adding ? "Adding..." : "Add philosophy item"}
      </button>
    </div>
  );
}
