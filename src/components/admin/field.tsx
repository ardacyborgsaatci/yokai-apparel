import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";

// Ids for aria-describedby: the help text first, then the error.
export function describedBy(
  id: string,
  hasHelp: boolean,
  error: string | undefined,
): string | undefined {
  const ids = [hasHelp ? `${id}-help` : null, error ? `${id}-error` : null];
  return ids.filter(Boolean).join(" ") || undefined;
}

// Lucide CircleAlert and text in text-destructive (DESIGN.md 7 Common rules).
export function FieldError({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-destructive">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// Label above the control, help text and then the error under it (DESIGN.md 4,
// Form field). The caller puts `id`, `aria-invalid` and `aria-describedby`
// (see describedBy) on the control.
export function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help ? (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

// First invalid control in page order takes focus (DESIGN.md 7.3, Check order).
export function focusFirstInvalid(root: HTMLElement | null) {
  const target = root?.querySelector<HTMLElement>(
    '[aria-invalid="true"], [data-invalid="true"]',
  );
  target?.focus();
}
