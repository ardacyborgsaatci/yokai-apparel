import type { Metadata } from "next";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Photographers behind the pictures on Yokai Apparel.",
};

type Credit = { use: string; name: string; url: string | null };

// Site images that are not stored in the database.
const SITE_CREDITS: Credit[] = [
  {
    use: "Home hero",
    name: "Shigeki Wakabayashi",
    url: "https://unsplash.com/photos/0kAfov1-W-s",
  },
  {
    use: "About page",
    name: "Valentin BEAUVAIS",
    url: "https://unsplash.com/photos/yVUQlyRlJSw",
  },
];

// Only an http(s) link goes on the page. The admin form checks this too.
function safeUrl(value: string | null): string | null {
  const url = value?.trim() ?? "";
  return /^https?:\/\//i.test(url) ? url : null;
}

export default async function CreditsPage() {
  const { products } = await getStore();

  const productCredits: Credit[] = products
    .flatMap((product) =>
      product.images
        // A credit name puts the image on this page. The link is optional.
        .filter((image) => image.credit_name?.trim())
        .map((image) => ({
          use: product.name,
          name: (image.credit_name as string).trim(),
          url: safeUrl(image.credit_url),
        })),
    )
    .sort((a, b) => a.use.localeCompare(b.use));

  const credits = [...SITE_CREDITS, ...productCredits];

  return (
    <div className="wrap pt-12 md:pt-16">
      <p className="eyebrow">Credits</p>
      <h1 className="display mt-2 text-5xl sm:text-7xl">Image credits</h1>

      <div className="mt-8 max-w-prose space-y-4 text-bone/90">
        <p>
          Each photo is credited to its photographer, with a link to the source
          when there is one. Unsplash photos are used under the{" "}
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone underline underline-offset-4 transition-colors hover:decoration-2 active:decoration-2 active:duration-0"
          >
            Unsplash License
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
        <p className="text-muted">
          Product photos show plain garments for demo purposes. The logo and
          all copy were written for this project.
        </p>
      </div>

      <ul className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
        {credits.map((credit, index) => (
          <li
            key={`${index}-${credit.use}`}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
          >
            <span className="font-semibold">{credit.use}</span>
            {credit.url ? (
              <a
                href={credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-bone underline underline-offset-4 transition-colors hover:decoration-2 active:decoration-2 active:duration-0"
              >
                Photo by {credit.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center">
                Photo by {credit.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
