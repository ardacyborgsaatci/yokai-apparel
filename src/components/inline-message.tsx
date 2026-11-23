import { CheckCircle, Info, Warning } from "@phosphor-icons/react/ssr";

type Kind = "error" | "success" | "info";

const ICONS = { error: Warning, success: CheckCircle, info: Info } as const;

// Error: error-token text, icon and border. Success and info: bone text, line border.
// The icon carries the kind, so color is never the only signal.
export function InlineMessage({
  kind,
  children,
  role,
  tabIndex,
  ref,
  className = "",
}: {
  kind: Kind;
  children: React.ReactNode;
  role?: "alert";
  tabIndex?: number;
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
}) {
  const Icon = ICONS[kind];
  const tone =
    kind === "error" ? "border-error text-error" : "border-line text-bone";
  return (
    <div
      ref={ref}
      role={role}
      tabIndex={tabIndex}
      className={`flex items-start gap-3 grain-panel rounded-xl border p-4 ${tone} ${className}`}
    >
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
