import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "The idea behind Yokai Apparel.",
};

export default function AboutPage() {
  return (
    <div className="wrap pt-12 md:pt-16">
      <p className="eyebrow">About</p>
      <h1 className="display mt-2 max-w-3xl text-5xl sm:text-7xl">
        Clothes for the spirits that walk at night
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_28rem] lg:gap-16">
        <div className="max-w-prose space-y-6 text-lg text-bone/90">
          <p>
            In Japanese folklore, yokai are the strange spirits of everyday
            life: a fox that wears a human face, a river child, an old
            umbrella that wakes up and walks away. They are playful and odd,
            and they never quite go away.
          </p>
          <p>
            Yokai Apparel borrows that mood for streetwear. Everything is black,
            off-white or grey, cut simple and made to be worn hard. One flame of
            vermilion is the mark of the brand, like a torii gate at a
            threshold.
          </p>
          <p>
            Each piece is named for a spirit: the Kitsune Tee, the Nue Hoodie,
            the Baku Tote.
          </p>

          <h2 className="display pt-6 text-3xl">About this demo</h2>
          <p>
            Yokai Apparel is a fictional brand and a portfolio project. The
            store is real code with a real database, but nothing is sold,
            shipped or charged. Product photos show plain garments, so a name
            like Kitsune Tee describes the idea, not a print you can see.
          </p>
          <p>
            <Link
              href="/shop"
              className="display inline-flex min-h-12 items-center bg-vermilion px-8 text-lg text-ink transition-colors hover:bg-bone"
            >
              Browse the shop
            </Link>
          </p>
        </div>

        <div className="relative aspect-[2/3] overflow-hidden bg-surface lg:self-start">
          <Image
            src="/images/tokyo-rain-street.webp"
            alt="A wet street in Tokyo at night, lit by neon signs"
            fill
            sizes="(min-width: 1024px) 28rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
