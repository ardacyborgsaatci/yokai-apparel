"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Home hero layers 1 to 4 (DESIGN.md 6.6): grain, photo, kanji, shade. All are
// aria-hidden and ignore the pointer. Scroll drift is CSS only (globals.css).
// This component runs the pointer tilt: the kanji layer and the photo's inner
// box lean a little toward the mouse. It writes --tx, --ty and --rot on them.

const NAMES = [
  { ja: "鬼", cls: "hero-k-oni" },
  { ja: "狐", cls: "hero-k-kitsune" },
  { ja: "天狗", cls: "hero-k-tengu" },
  { ja: "河童", cls: "hero-k-kappa" },
];

const LAG = 0.12; // seconds, time constant of the smoothing
const PROPS = ["--tx", "--ty", "--rot"] as const;

type Layer = { el: HTMLElement; shift: number; rot: number; x: number; y: number; r: number };

export function HeroLayers() {
  const kanji = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = kanji.current;
    const p = photo.current;
    const hero = k?.parentElement;
    if (!k || !p || !hero) return;

    const layers: Layer[] = [
      { el: k, shift: 12, rot: 3, x: 0, y: 0, r: 0 },
      { el: p, shift: 6, rot: 1.2, x: 0, y: 0, r: 0 },
    ];
    const fine = matchMedia("(pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let nx = 0; // pointer, -1 to 1 on each axis, inside the unit circle
    let ny = 0;
    let raf = 0;
    let last = 0;
    let seen = true;
    let on = false;

    const write = (l: Layer) => {
      l.el.style.setProperty("--tx", `${l.x.toFixed(2)}px`);
      l.el.style.setProperty("--ty", `${l.y.toFixed(2)}px`);
      l.el.style.setProperty("--rot", `${l.r.toFixed(3)}deg`);
    };

    // Exponential smoothing scaled by frame time, so the lag does not depend on
    // the frame rate. The loop stops when every layer has settled.
    const frame = (t: number) => {
      // rAF time can be earlier than the performance.now() of the first move.
      const dt = Math.max(0, Math.min((t - last) / 1000, 0.05));
      last = t;
      const a = 1 - Math.exp(-dt / LAG);
      let moving = false;
      for (const l of layers) {
        const tx = -nx * l.shift;
        const ty = -ny * l.shift;
        const tr = nx * l.rot;
        l.x += (tx - l.x) * a;
        l.y += (ty - l.y) * a;
        l.r += (tr - l.r) * a;
        if (Math.abs(tx - l.x) > 0.02 || Math.abs(ty - l.y) > 0.02 || Math.abs(tr - l.r) > 0.002) {
          moving = true;
        }
        write(l);
      }
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const kick = () => {
      if (raf || !seen || !on) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      let x = (e.clientX / innerWidth) * 2 - 1;
      let y = (e.clientY / innerHeight) * 2 - 1;
      const len = Math.hypot(x, y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
      nx = x;
      ny = y;
      kick();
    };

    const onLeave = () => {
      nx = 0;
      ny = 0;
      kick();
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      nx = 0;
      ny = 0;
      for (const l of layers) {
        l.x = l.y = l.r = 0;
        for (const name of PROPS) l.el.style.removeProperty(name);
      }
    };

    // Listeners only while a fine pointer is present and motion is allowed.
    const opt = { passive: true };
    const sync = () => {
      const want = fine.matches && !reduce.matches;
      if (want && !on) {
        addEventListener("pointermove", onMove, opt);
        document.documentElement.addEventListener("pointerleave", onLeave, opt);
        on = true;
      } else if (!want && on) {
        removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        on = false;
        reset();
      }
    };

    // No frames while the hero is offscreen. Coming back, catch up if needed.
    const io = new IntersectionObserver((entries) => {
      seen = entries[0].isIntersecting;
      if (seen) kick();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });

    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    io.observe(hero);
    sync();

    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      io.disconnect();
      if (on) {
        removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        on = false;
      }
      reset();
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="hero-layer hero-grain" />
      <div aria-hidden="true" className="hero-layer hero-photo hero-scroll">
        <div ref={photo} className="hero-photo-tilt hero-tilt">
          <Image
            src="/images/hero-dark-street.webp"
            alt=""
            fill
            preload
            sizes="100vw"
            className="hero-photo-img object-cover"
          />
        </div>
      </div>
      <div
        ref={kanji}
        aria-hidden="true"
        lang="ja"
        className="hero-layer hero-kanji hero-tilt"
      >
        {NAMES.map(({ ja, cls }) => (
          <span key={cls} className={`hero-k hero-scroll font-jp font-medium ${cls}`}>
            {ja}
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="hero-layer hero-shade" />
    </>
  );
}
