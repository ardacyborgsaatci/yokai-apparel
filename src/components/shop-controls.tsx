"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { SIZE_FILTERS, SORT_OPTIONS, shopHref, type SortKey } from "@/lib/catalog";

const LABEL = "text-xs font-semibold uppercase tracking-[0.2em] text-muted";
const ALL_SIZES = "";

// Size (native radio group drawn as chips) and sort (native select).
// The choice is written to the URL, so a result has its own address.
// The category filter stays as links in ShopView.
type Choice = { size: string; sort: string };

export function ShopControls({
  category,
  size,
  sort,
}: {
  category: string | undefined;
  size: string | undefined;
  sort: SortKey;
}) {
  const router = useRouter();
  // Next.js keeps the previous page hidden in the DOM after a client navigation
  // (for example Shop, then Tees). Two copies of these controls then exist, so
  // ids and the radio group name must be unique per copy. A shared name makes
  // both copies one radio group, and the hidden copy steals the checked state.
  const uid = useId();
  const [pending, startTransition] = useTransition();
  // What the visitor picked last. It shows at once, before the URL catches up.
  // null means the controls follow the URL.
  const [wanted, setWanted] = useState<Choice | null>(null);
  // Next.js drops a navigation when a newer one starts. Fast keys (arrow keys
  // in the size group) would lose history entries. So only one push runs at a
  // time, and the rest wait here, in order.
  const waiting = useRef<Choice[]>([]);
  const sending = useRef(false);
  const shown = wanted ?? { size: size ?? ALL_SIZES, sort };

  const send = useCallback(
    (next: Choice) => {
      sending.current = true;
      startTransition(() => {
        router.push(
          shopHref(category, {
            size: next.size || undefined,
            sort: next.sort as SortKey,
          }),
          { scroll: false },
        );
      });
    },
    [category, router],
  );

  function update(next: Choice) {
    setWanted(next);
    if (sending.current) waiting.current.push(next);
    else send(next);
  }

  // A push has finished: send the next waiting one, or hand control back to the URL.
  useEffect(() => {
    if (pending) return;
    const next = waiting.current.shift();
    if (next) {
      send(next);
      return;
    }
    sending.current = false;
    setWanted(null);
  }, [pending, send]);

  return (
    <>
      <fieldset className="min-w-0">
        <legend className={`${LABEL} mb-2`}>Size</legend>
        <div className="flex flex-wrap gap-2">
          {[ALL_SIZES, ...SIZE_FILTERS].map((value) => {
            const id = `${uid}-size-${(value || "all").replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <div key={id}>
                <input
                  type="radio"
                  name={`${uid}-size`}
                  id={id}
                  value={value}
                  checked={shown.size === value}
                  onChange={() => update({ size: value, sort: shown.sort })}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-muted px-4 text-sm font-semibold text-bone transition-colors hover:border-bone active:border-bone active:bg-raised active:duration-0 peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-checked:active:border-bone peer-checked:active:bg-bone peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-bone"
                >
                  {value || "All"}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-sort`} className={LABEL}>
          Sort by
        </label>
        <select
          id={`${uid}-sort`}
          value={shown.sort}
          onChange={(event) =>
            update({ size: shown.size, sort: event.target.value })
          }
          className="min-h-11 rounded-lg border border-muted bg-ink px-3 text-sm font-semibold text-bone transition-colors hover:border-bone active:border-bone active:duration-0"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
