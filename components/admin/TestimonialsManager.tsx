"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import Badge from "@/components/ui/Badge";

interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  published: boolean;
  order: number;
}

export default function TestimonialsManager({
  initialItems,
}: {
  initialItems: TestimonialItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function updateItem(id: string, patch: Partial<TestimonialItem>) {
    const previous = items;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
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

  async function persistOrder(nextItems: TestimonialItem[]) {
    try {
      const res = await fetch("/api/admin/testimonials", {
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
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to delete testimonial."));
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Failed to delete testimonial.");
    }
  }

  async function addItem() {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: "New testimonial quote",
          name: "Client Name",
          published: false,
        }),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to add testimonial."));
      const data = await res.json();
      setItems((prev) => [...prev, data.testimonial]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add testimonial.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-rosewood">{error}</p>}

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-paper p-4"
          >
            <div className="flex items-start gap-4">
              <input
                type="text"
                placeholder="Client name"
                defaultValue={item.name}
                onBlur={(e) => updateItem(item.id, { name: e.target.value })}
                className="flex-1 rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm font-medium"
              />
              <button
                onClick={() => updateItem(item.id, { published: !item.published })}
                className="shrink-0"
              >
                <Badge tone={item.published ? "marigold" : "olive"}>
                  {item.published ? "Published" : "Hidden"}
                </Badge>
              </button>
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
              placeholder="Quote"
              defaultValue={item.quote}
              onBlur={(e) => updateItem(item.id, { quote: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm"
              rows={2}
            />
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-ink-soft">No testimonials yet.</p>
        )}
      </div>

      <button
        onClick={addItem}
        disabled={adding}
        className="mt-4 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-marigold hover:text-marigold-dark disabled:opacity-50"
      >
        {adding ? "Adding..." : "Add testimonial"}
      </button>
    </div>
  );
}
