"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { todayKey } from "@/lib/event-date";
import type { FieldTone } from "@/components/ui/Input";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Local YYYY-MM-DD. Deliberately not toISOString(), which converts to UTC
 * and shifts the date by a day for anyone east of Greenwich — including
 * every client in India.
 */
function toKey(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseKey(key?: string): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * "Today" comes from the shared helper, which pins it to the studio's
 * timezone. Using the browser's local date instead would let a visitor
 * abroad pick a day the server then rejects.
 */
function studioToday(): Date {
  return parseKey(todayKey()) as Date;
}

interface DatePickerProps {
  id?: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  tone?: FieldTone;
}

export default function DatePicker({
  id = "date",
  label,
  value,
  onChange,
  onBlur,
  error,
  tone = "light",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [cursor, setCursor] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Resolved when the calendar opens, not during render. The contact page is
  // statically generated, so a render-time value would be frozen at build
  // time; opening it fresh also keeps a long-open tab correct past midnight.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const t = studioToday();
    setToday(t);
    setCursor(parseKey(value) ?? t);
    setOpen(true);
  }

  const selected = parseKey(value);

  const grid = useMemo(() => {
    if (!cursor) return [];
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [cursor]);

  // Never let the visitor page back past the current month.
  const atFirstMonth =
    !!today &&
    !!cursor &&
    cursor.getFullYear() === today.getFullYear() &&
    cursor.getMonth() === today.getMonth();

  function shiftMonth(delta: number) {
    setCursor((c) => (c ? new Date(c.getFullYear(), c.getMonth() + delta, 1) : c));
  }

  function pick(d: Date) {
    onChange(toKey(d));
    setOpen(false);
    onBlur?.();
  }

  const triggerLabel = selected
    ? selected.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select a date";

  const dark = tone === "dark";

  return (
    <div className="flex flex-col gap-1.5" ref={rootRef}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium ${dark ? "text-linen/65" : "text-ink-soft"}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left font-body text-base leading-normal transition-colors focus-visible:border-marigold focus-visible:outline-none ${
            dark ? "bg-linen/8" : "bg-linen"
          } ${
            error
              ? "border-rosewood"
              : dark
                ? "border-linen/20 hover:border-linen/35"
                : "border-ink/15 hover:border-ink/30"
          } ${selected ? (dark ? "text-linen" : "text-ink") : dark ? "text-linen/35" : "text-ink/40"}`}
        >          {triggerLabel}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[18px] w-[18px] shrink-0 text-marigold-dark"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>

        <AnimatePresence>
          {open && cursor && today && (
            <motion.div
              role="dialog"
              aria-label="Choose a date"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-[calc(100%+8px)] z-30 w-[20.5rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-ink/10 bg-[color-mix(in_srgb,var(--color-linen)_45%,white)] p-4 shadow-[0_18px_50px_-20px_rgba(43,27,18,0.45)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  disabled={atFirstMonth}
                  aria-label="Previous month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <div className="text-center">
                  <p className="font-display text-base leading-tight text-ink">
                    {MONTHS[cursor.getMonth()]}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft/60">
                    {cursor.getFullYear()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-soft/45"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {grid.map((d, i) => {
                  if (!d) return <span key={`pad-${i}`} />;
                  const key = toKey(d);
                  const isPast = d < today;
                  const isToday = key === toKey(today);
                  const isSelected = !!selected && key === toKey(selected);

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isPast}
                      onClick={() => pick(d)}
                      aria-label={d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      aria-current={isToday ? "date" : undefined}
                      className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                        isPast
                          ? "cursor-not-allowed text-ink/20"
                          : isSelected
                            ? "cursor-pointer bg-marigold-dark font-medium text-linen"
                            : "cursor-pointer text-ink hover:bg-paper"
                      }`}
                    >
                      {d.getDate()}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-marigold-dark" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <button
                  type="button"
                  onClick={() => pick(today)}
                  className="cursor-pointer text-xs font-medium text-marigold-dark transition-opacity hover:opacity-70"
                >
                  Today
                </button>
                {selected && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="cursor-pointer text-xs text-ink-soft/70 transition-colors hover:text-rosewood"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <span
          className={`text-xs ${
            dark
              ? "text-[color-mix(in_srgb,var(--color-rosewood)_60%,white)]"
              : "text-rosewood"
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
}
