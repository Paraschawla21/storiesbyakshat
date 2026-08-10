"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/format";

type MsgStatus = "NEW" | "READ" | "RESPONDED";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string | null;
  eventDate: string | null;
  message: string | null;
  status: MsgStatus;
  createdAt: string;
}

const statusTone: Record<MsgStatus, "marigold" | "olive" | "rosewood"> = {
  NEW: "marigold",
  READ: "olive",
  RESPONDED: "rosewood",
};

export default function MessagesList({
  initialMessages,
}: {
  initialMessages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<MsgStatus | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: MsgStatus) {
    const previous = messages;
    setError(null);
    setMessages((msgs) => msgs.map((m) => (m.id === id ? { ...m, status } : m)));

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
    } catch (err) {
      setMessages(previous);
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  async function deleteMessage(id: string, name: string) {
    if (
      !confirm(
        `Delete the enquiry from ${name}? This permanently removes it and cannot be undone.`
      )
    ) {
      return;
    }

    const previous = messages;
    setError(null);
    setMessages((msgs) => msgs.filter((m) => m.id !== id));

    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete enquiry.");
    } catch (err) {
      setMessages(previous);
      setError(err instanceof Error ? err.message : "Failed to delete enquiry.");
    }
  }

  const filtered =
    filter === "ALL" ? messages : messages.filter((m) => m.status === filter);

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-rosewood/10 px-4 py-2 text-sm text-rosewood">
          {error}
        </p>
      )}
      <div className="mb-6 flex gap-2">
        {(["ALL", "NEW", "READ", "RESPONDED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === f
                ? "border-marigold bg-marigold text-linen"
                : "border-ink/15 text-ink hover:border-marigold"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-ink/10 bg-paper p-5"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display text-lg text-ink">{m.name}</p>
                <p className="text-sm text-ink-soft">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
              </div>
              <Badge tone={statusTone[m.status]}>{m.status}</Badge>
            </div>

            <p className="mb-3 text-sm text-ink-soft">
              {[
                m.eventType,
                m.eventDate ? formatDateShort(m.eventDate) : null,
                `Received ${formatDateShort(m.createdAt)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <p className="mb-4 whitespace-pre-wrap text-ink">
              {m.message?.trim() || (
                <span className="italic text-ink-soft">No message provided.</span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {(["NEW", "READ", "RESPONDED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(m.id, s)}
                  disabled={m.status === s}
                  className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-marigold hover:text-marigold-dark disabled:opacity-40"
                >
                  Mark {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}

              <button
                onClick={() => deleteMessage(m.id, m.name)}
                className="ml-auto rounded-full border border-rosewood/30 px-3 py-1 text-xs font-medium text-rosewood transition-colors hover:border-rosewood hover:bg-rosewood/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-ink-soft">No messages in this view.</p>
        )}
      </div>
    </div>
  );
}
