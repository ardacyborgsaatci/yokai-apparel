"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { SIZE_FILTERS, SORT_OPTIONS, shopHref, type SortKey } from "@/lib/catalog";

const LABEL = "text-xs font-semibold uppercase tracking-[0.2em] text-muted";
const ALL_SIZES = "";

// Size (native radio group drawn as chips) and sort (native select).
// The choice is written to the URL, so a result has its own address.
// The category filter stays as links in ShopView.
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
  const [, startTransition] = useTransition();
  const [shownSize, setShownSize] = useOptimistic(size ?? ALL_SIZES);
  const [shownSort, setShownSort] = useOptimistic<string>(sort);

  function update(next: { size: string; sort: string }) {
    startTransition(() => {
      setShownSize(next.size);
      setShownSort(next.sort);
      router.push(
        shopHref(category, {
          size: next.size || undefined,
          sort: next.sort as SortKey,
        }),
        { scroll: false },
      );
    });
  }

  return (
    <>
      <fieldset className="min-w-0">
        <legend className={`${LABEL} mb-2`}>Size</legend>
        <div className="flex flex-wrap gap-2">
          {[ALL_SIZES, ...SIZE_FILTERS].map((value) => {
            const id = `filter-size-${(value || "all").replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <div key={id}>
                <input
                  type="radio"
                  name="size"
                  id={id}
                  value={value}
                  checked={shownSize === value}
                  onChange={() => update({ size: value, sort: shownSort })}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-muted px-4 text-sm font-semibold text-bone transition-colors hover:border-bone peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-vermilion"
                >
                  {value || "All"}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="shop-sort" className={LABEL}>
          Sort by
        </label>
        <select
          id="shop-sort"
          value={shownSort}
          onChange={(event) =>
            update({ size: shownSize, sort: event.target.value })
          }
          className="min-h-11 border border-muted bg-ink px-3 text-sm font-semibold text-bone transition-colors hover:border-bone"
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
