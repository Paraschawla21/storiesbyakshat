import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  forwardRef,
} from "react";

const fieldBase =
  "w-full rounded-xl border border-ink/15 bg-linen px-4 py-3 font-body text-base leading-normal text-ink placeholder:text-ink/40 transition-colors focus-visible:border-marigold focus-visible:outline-none";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${fieldBase} ${error ? "border-rosewood" : ""} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rosewood">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`${fieldBase} min-h-32 resize-y ${error ? "border-rosewood" : ""} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rosewood">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`${fieldBase} appearance-none pr-10 ${error ? "border-rosewood" : ""} ${className}`}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
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
        {error && <span className="text-xs text-rosewood">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
