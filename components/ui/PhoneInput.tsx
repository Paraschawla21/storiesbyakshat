"use client";

import { forwardRef, useMemo, useState } from "react";
import {
  COUNTRY_CODES,
  parsePhoneValue,
  formatPhoneValue,
  getCountryByDial,
} from "@/lib/phone";

interface PhoneInputProps {
  id?: string;
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ id, label, error, value, onChange, onBlur, name }, ref) => {
    const parsed = useMemo(() => parsePhoneValue(value), [value]);
    const [dial, setDial] = useState(parsed.dial);
    const country = getCountryByDial(dial);

    function emit(nextDial: string, nextDigits: string) {
      onChange?.(formatPhoneValue(nextDial, nextDigits));
    }

    function handleDigitsChange(raw: string) {
      const digitsOnly = raw.replace(/\D/g, "").slice(0, country.maxDigits);
      emit(dial, digitsOnly);
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <div
          className={`flex w-full items-stretch overflow-hidden rounded-xl border bg-linen transition-colors focus-within:border-marigold ${
            error ? "border-rosewood" : "border-ink/15"
          }`}
        >
          <div className="relative shrink-0 border-r border-ink/15">
            <select
              aria-label="Country code"
              value={dial}
              onChange={(e) => {
                const nextDial = e.target.value;
                setDial(nextDial);
                // Re-cap digits to the new country's max length when switching.
                const nextCountry = getCountryByDial(nextDial);
                const cappedDigits = parsed.digits.slice(0, nextCountry.maxDigits);
                emit(nextDial, cappedDigits);
              }}
              className="h-full w-[3.75rem] appearance-none bg-transparent py-3 pl-3 pr-5 font-body text-base leading-normal text-ink focus-visible:outline-none"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.dial}>
                  {c.dial}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
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

          <input
            ref={ref}
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            placeholder={`${country.minDigits === country.maxDigits ? country.minDigits : `${country.minDigits}-${country.maxDigits}`} digit number`}
            value={parsed.digits}
            onChange={(e) => handleDigitsChange(e.target.value)}
            onBlur={onBlur}
            maxLength={country.maxDigits}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-body text-base leading-normal text-ink placeholder:text-ink/40 focus-visible:outline-none"
          />
        </div>
        {error && <span className="text-xs text-rosewood">{error}</span>}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
