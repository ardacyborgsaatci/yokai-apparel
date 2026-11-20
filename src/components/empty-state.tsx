import Link from "next/link";

// A bordered block: heading, one muted line, one primary button.
export function EmptyState({
  heading,
  line,
  actionLabel,
  actionHref,
  onAction,
  headingRef,
}: {
  heading: string;
  line: string;
  actionLabel: string;
  actionHref: string;
  // Runs on click, for example to close the cart drawer.
  onAction?: () => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="border border-line p-8">
      <h2 ref={headingRef} tabIndex={-1} className="display text-3xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-md text-muted">{line}</p>
      <Link
        href={actionHref}
        onClick={onAction}
        className="display mt-6 inline-flex min-h-12 items-center bg-vermilion px-8 text-lg text-ink transition-colors hover:bg-bone"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
