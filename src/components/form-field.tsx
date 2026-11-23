"use client";

import { Warning } from "@phosphor-icons/react";

// Label above the input. Help text, then the error, under the input.
// An invalid field has an error border, aria-invalid and aria-describedby.
export function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  help,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  required = false,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string | null;
  help?: string;
  type?: "text" | "email";
  inputMode?: "numeric" | "email";
  autoComplete: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`recessed mt-2 block min-h-12 w-full rounded-lg border bg-raised px-4 text-base text-bone ${
          error ? "border-error" : "border-muted hover:border-bone"
        }`}
      />
      {help && (
        <p id={helpId} className="mt-2 text-sm text-muted">
          {help}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="mt-2 flex items-start gap-2 text-sm text-error"
        >
          <Warning size={20} aria-hidden="true" className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
