"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Home hero light (DESIGN.md 6.5). Renders the lit photo and the 12 kanji as
// two clipped boxes beside the hero text, and moves the light by writing
// --lx and --ly on the hero. The CSS default puts the light on the first name,
// so the first frame is right before JS runs and with reduced motion.

type Place = [x: string, y: string, size: number];
type Name = {
  ja: string;
  ro: string;
  lg: Place;
  sm?: Place;
  tiny?: true;
  mid?: true;
};

// Order is the order of the drift. sm is the place below lg (omitted: hidden
// there). tiny: also hidden below 360px. mid: also hidden from 640 to 767px,
// where the taller headline puts the name in the protected area.
const AX = "var(--ax)";
const AY = "var(--ay)";
const NAMES: Name[] = [
  { ja: "鬼", ro: "oni", lg: [AX, AY, 120], sm: [AX, AY, 80] },
  { ja: "河童", ro: "kappa", lg: ["93%", "30%", 80], sm: ["40%", "12.5%", 48], mid: true },
  { ja: "絡新婦", ro: "jorogumo", lg: ["93%", "65%", 64] },
  { ja: "幽霊", ro: "yurei", lg: ["83%", "56%", 88] },
  { ja: "天狗", ro: "tengu", lg: ["84%", "85%", 72] },
  { ja: "木霊", ro: "kodama", lg: ["72%", "80%", 60] },
  { ja: "化け猫", ro: "bakeneko", lg: ["72%", "40%", 72] },
  { ja: "傘おばけ", ro: "kasa-obake", lg: ["62%", "63%", 56] },
  { ja: "狐", ro: "kitsune", lg: ["62%", "22%", 96], sm: ["61%", "6.5%", 48] },
  { ja: "獏", ro: "baku", lg: ["40%", "8%", 48], sm: ["61%", "18.5%", 44], tiny: true, mid: true },
  { ja: "鵺", ro: "nue", lg: ["27%", "8.5%", 80], sm: ["84%", "18.5%", 48], tiny: true },
  { ja: "狸", ro: "tanuki", lg: ["12%", "9%", 64], sm: ["84%", "6.5%", 44] },
];

export function Lantern() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = root.current?.closest<HTMLElement>("[data-lantern]");
    if (!hero) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const IDLE = 3000; // ms without pointer input before the light drifts
    const LAG = 120; // ms, exponential lag of the pointer follow
    const SPEED = 70; // px per second between names
    const DWELL = 900; // ms to rest on a name
    let pts: [number, number][] = [];
    let ox = 0, oy = 0; // hero origin on the page
    let x = 0, y = 0, tx = 0, ty = 0; // light, and where it is heading
    let wx = -1, wy = -1; // last written
    let follow = true, seen = true, raf = 0, last = 0;
    let idleAt = matchMedia("(pointer: coarse)").matches ? -1e9 : performance.now();
    let idx = 0, dir = 1, fx = 0, fy = 0, dur = 0, el = 0, rest = 0;
    let down: [number, number] | null = null;

    // The only layout reads: once per resize, never inside the frame loop.
    const measure = () => {
      const r = hero.getBoundingClientRect();
      ox = r.left + scrollX;
      oy = r.top + scrollY;
      pts = [];
      hero.querySelectorAll<HTMLElement>("[data-name]").forEach((k) => {
        const b = k.getBoundingClientRect();
        if (b.width) pts.push([b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]);
      });
      if (pts.length) {
        x = tx = fx = pts[0][0];
        y = ty = fy = pts[0][1];
      }
    };

    const go = (i: number) => {
      const p = pts[i];
      follow = false;
      idx = i;
      fx = x;
      fy = y;
      el = rest = 0;
      dur = Math.min(7000, Math.max(1500, (Math.hypot(p[0] - x, p[1] - y) / SPEED) * 1000));
    };

    // Next name in the tour. It turns back at both ends, so no long jump.
    const step = (i: number) => {
      if (i + dir < 0 || i + dir >= pts.length) dir = -dir;
      return Math.max(0, Math.min(pts.length - 1, i + dir));
    };

    // First leg of a drift: the nearest name, or the next one if already on it.
    const start = () => {
      let best = 0, bd = Infinity;
      pts.forEach((p, i) => {
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      go(bd < 40 ? step(best) : best);
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(t - last, 50);
      last = t;
      if (follow && t - idleAt > IDLE) start();
      if (follow) {
        const a = 1 - Math.exp(-dt / LAG);
        x += (tx - x) * a;
        y += (ty - y) * a;
      } else if (el < dur) {
        el += dt;
        let u = Math.min(el / dur, 1);
        u = u * u * (3 - 2 * u); // smoothstep
        const p = pts[idx % pts.length];
        x = fx + (p[0] - fx) * u;
        y = fy + (p[1] - fy) * u;
      } else if ((rest += dt) > DWELL) {
        go(step(idx));
      }
      if (Math.abs(x - wx) + Math.abs(y - wy) > 0.05) {
        hero.style.setProperty("--lx", `${x.toFixed(1)}px`);
        hero.style.setProperty("--ly", `${y.toFixed(1)}px`);
        wx = x;
        wy = y;
      }
    };

    const sync = () => {
      const run = seen && !document.hidden && !reduce.matches && pts.length > 0;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const aim = (e: PointerEvent) => {
      tx = e.pageX - ox;
      ty = e.pageY - oy;
      follow = true;
      idleAt = performance.now();
    };
    // Passive listeners only: nothing here can block scrolling.
    const opt = { passive: true };
    const onMove = (e: PointerEvent) => e.pointerType !== "touch" && aim(e);
    const onDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
    };
    // A tap is a pointerup close to its pointerdown. A scroll ends in pointercancel.
    const onUp = (e: PointerEvent) => {
      if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 10) aim(e);
      down = null;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") idleAt = performance.now();
    };
    const onReduce = () => {
      if (reduce.matches) {
        hero.style.removeProperty("--lx");
        hero.style.removeProperty("--ly");
        wx = wy = -1;
      } else measure();
      sync();
    };
    const io = new IntersectionObserver((e) => {
      seen = e[0].isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(() => {
      if (!reduce.matches) {
        measure();
        sync();
      }
    });

    hero.addEventListener("pointermove", onMove, opt);
    hero.addEventListener("pointerdown", onDown, opt);
    hero.addEventListener("pointerup", onUp, opt);
    hero.addEventListener("pointerleave", onLeave, opt);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", onReduce);
    io.observe(hero);
    ro.observe(hero);

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", onReduce);
      io.disconnect();
      ro.disconnect();
      hero.style.removeProperty("--lx");
      hero.style.removeProperty("--ly");
    };
  }, []);

  return (
    <>
      <div ref={root} className="lamp lamp-photo" aria-hidden="true">
        <div className="lamp-beam lamp-lit" />
      </div>
      <div className="lamp lamp-kanji" aria-hidden="true">
        <div className="lamp-beam lamp-glyphs">
          {NAMES.map(({ ja, ro, lg, sm, tiny, mid }) => (
            <span
              key={ro}
              data-name=""
              className={`lamp-k${sm ? "" : " lamp-k-lg"}${tiny ? " lamp-k-tiny" : ""}${mid ? " lamp-k-mid" : ""}`}
              style={
                {
                  "--dx": lg[0],
                  "--dy": lg[1],
                  "--ds": lg[2],
                  "--px": sm?.[0],
                  "--py": sm?.[1],
                  "--ps": sm?.[2],
                } as CSSProperties
              }
            >
              <span lang="ja" className="lamp-ja font-jp font-medium">
                {ja}
              </span>
              <span className="lamp-ro">{ro}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
