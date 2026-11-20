"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/catalog";

export function Gallery({ images }: { images: ProductImage[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-surface text-muted">
        No image yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          key={current.path}
          src={current.path}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <li key={image.path}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                className={`relative block aspect-[4/5] w-full overflow-hidden border-2 bg-surface ${
                  i === index ? "border-vermilion" : "border-transparent"
                }`}
              >
                <Image
                  src={image.path}
                  alt=""
                  fill
                  sizes="12vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
