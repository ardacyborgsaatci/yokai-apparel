import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Noto Sans JP 500, only the glyphs used: every name_ja value. The Home hero
// kanji (parallax layers, 4 names) are the same glyphs. next/font has no
// `text` option, so this is a <link> element.
// Add a glyph here when a new name_ja value needs one.
const JP_GLYPHS = "狐鬼狸河童天狗鵺幽霊絡新婦木霊獏化け猫傘おば";
const JP_FONT_URL = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500&display=swap&text=${encodeURIComponent(JP_GLYPHS)}`;

export const metadata: Metadata = {
  title: {
    default: "Yokai Apparel",
    template: "%s | Yokai Apparel",
  },
  description:
    "Dark, minimal streetwear inspired by Japanese folklore. A demo store: no real orders or payments.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={JP_FONT_URL} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-red focus:px-4 focus:py-3 focus:font-semibold focus:text-bone"
        >
          Skip to content
        </a>
        {/* Each layout below renders its own header and the one
            <main id="main">: the store layout and the admin layouts. */}
        {children}
      </body>
    </html>
  );
}
