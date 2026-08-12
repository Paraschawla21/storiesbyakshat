import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  forwardRef,
} from "react";

export type FieldTone = "light" | "dark";

/**
 * These fields are shared between the light-background admin forms and the
 * contact form's dark card, so the styling branches on `tone` rather than
 * having two near-duplicate sets of components to keep in sync.
 */
function fieldClasses(tone: FieldTone, hasError: boolean) {
  const base =
    "w-full rounded-xl border px-4 py-3 font-body text-base leading-normal transition-colors focus-visible:border-marigold focus-visible:outline-none";

  if (tone === "dark") {
    return `${base} bg-linen/8 text-linen placeholder:text-linen/35 ${
      hasError ? "border-rosewood" : "border-linen/20"
    }`;
  }

  return `${base} bg-linen text-ink placeholder:text-ink/40 ${
    hasError ? "border-rosewood" : "border-ink/15"
  }`;
}

function labelClasses(tone: FieldTone) {
  return tone === "dark"
    ? "text-sm font-medium text-linen/65"
    : "text-sm font-medium text-ink-soft";
}

function errorClasses(tone: FieldTone) {
  // A plain border-only tint doesn't have to meet text contrast ratios, but
  // the message itself does — rosewood at full strength reads too dark
  // against the dark card, so it's lightened just for that tone.
  return tone === "dark"
    ? "text-xs text-[color-mix(in_srgb,var(--color-rosewood)_60%,white)]"
    : "text-xs text-rosewood";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  tone?: FieldTone;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, tone = "light", className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className={labelClasses(tone)}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${fieldClasses(tone, !!error)} ${className}`}
          {...props}
        />
        {error && <span className={errorClasses(tone)}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  tone?: FieldTone;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, tone = "light", className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className={labelClasses(tone)}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`${fieldClasses(tone, !!error)} min-h-32 resize-y ${className}`}
          {...props}
        />
        {error && <span className={errorClasses(tone)}>{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  tone?: FieldTone;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, tone = "light", className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className={labelClasses(tone)}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`${fieldClasses(tone, !!error)} appearance-none pr-10 ${className}`}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
              tone === "dark" ? "text-linen/50" : "text-ink-soft"
            }`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error && <span className={errorClasses(tone)}>{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
