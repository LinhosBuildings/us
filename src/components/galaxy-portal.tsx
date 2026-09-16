"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LoveDuo } from "@/components/love-duo";

const HEARTS = ["♥", "♥", "♥", "♡", "♥", "♡", "♥", "♥", "♡"];

const STAR_COLORS = ["#e44297", "#f880be", "#f0b25e", "#d95aa0", "#c2185b"];
const NEAR_STAR_COLORS = ["#f078bb", "#f0b25e", "#e44297"];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Stars({
  count,
  seed,
  baseSize,
  drift,
  colors,
  glow,
}: {
  count: number;
  seed: number;
  baseSize: number;
  drift: number;
  colors: string[];
  glow?: boolean;
}) {
  const rnd = useMemo(() => mulberry32(seed), [seed]);
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = baseSize * (0.7 + rnd() * 1.1);
        const base = 0.3 + rnd() * 0.55;
        return {
          left: rnd() * 98,
          top: rnd() * 96,
          size,
          base,
          color: colors[(rnd() * colors.length) | 0],
          dur: (3.2 + rnd() * 3.6).toFixed(2),
          delay: (rnd() * 4).toFixed(2),
          glowValue: glow
            ? `0 0 ${(size * 2.6).toFixed(1)}px ${colors[0]}, 0 0 ${(size * 5.2).toFixed(1)}px rgba(255,255,255,0.22)`
            : undefined,
        };
      }),
    [count, colors, rnd]
  );

  return (
    <div
      className="animate-gal-drift pointer-events-none absolute inset-0"
      style={{ animationDuration: `${drift}s`, animationDelay: `${(-drift * 0.4).toFixed(1)}s` }}
      aria-hidden
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="animate-gal-star absolute rounded-full"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: s.color,
              boxShadow: s.glowValue,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              "--star-base": `${s.base}`,
            } as CSSProperties & Record<string, string>
          }
        />
      ))}
    </div>
  );
}

function FloatingHearts({ intense }: { intense: boolean }) {
  const rnd = useMemo(() => mulberry32(5), []);
  const hearts = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        left: 8 + rnd() * 72,
        top: 6 + rnd() * 30,
        size: 9 + rnd() * 9,
        o: 0.45 + rnd() * 0.4,
        dur: (5 + rnd() * 3).toFixed(2),
        delay: (rnd() * 4).toFixed(2),
        color: i % 2 === 0 ? "#e44297" : "#f0b25e",
      })),
    [rnd]
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="animate-gal-heart-rise absolute"
          style={
            {
              left: `${h.left}%`,
              top: `${h.top}%`,
              fontSize: `${h.size}px`,
              color: h.color,
              filter: `drop-shadow(0 0 ${intense ? 9 : 5}px ${h.color})`,
              animationDuration: intense ? `${Math.min(Number(h.dur) * 0.6, 3.4).toFixed(2)}s` : `${h.dur}s`,
              animationDelay: `${h.delay}s`,
              "--h-o": `${intense ? Math.min(h.o + 0.2, 0.95) : h.o}`,
            } as CSSProperties & Record<string, string>
          }
        >
          {HEARTS[i % HEARTS.length]}
        </span>
      ))}
    </div>
  );
}

export function GalaxyPortal({
  coupleTitle = "Our Little Universe",
  subtitle = "Just you. Just me. Just us.",
  enterLabel = "Enter our world ♡",
  children,
}: {
  coupleTitle?: string;
  subtitle?: string;
  enterLabel?: string;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<"hero" | "entering" | "gate">("hero");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  function enter() {
    if (phase !== "hero") return;
    setPhase("entering");
    timers.current.push(setTimeout(() => setPhase("gate"), 900));
  }

  const gate = phase === "gate";
  const entering = phase === "entering";

  return (
    <main className="gal-base relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      {/* rose / gold / pink breathing glows */}
      <div className="animate-gal-glow pointer-events-none absolute -bottom-32 -left-32 h-[46vh] w-[46vh] rounded-full bg-[#e44297]/20 blur-[110px]" />
      <div
        className="animate-gal-glow pointer-events-none absolute -right-28 bottom-1/4 h-[42vh] w-[42vh] rounded-full bg-[#e44297]/16 blur-[110px]"
        style={{ animationDelay: "-2.6s" }}
      />
      <div
        className="animate-gal-glow pointer-events-none absolute -right-16 -top-24 h-[52vh] w-[52vh] rounded-full bg-[#f0b25e]/22 blur-[120px]"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-gal-glow pointer-events-none absolute left-1/2 top-1/2 h-[56vh] w-[56vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9bc9]/18 blur-[130px]"
        style={{ animationDelay: "-3.6s" }}
      />

      {/* particle depth: distant / medium glow / near blurred */}
      <Stars count={30} seed={21} baseSize={1.1} drift={16} colors={STAR_COLORS} />
      <div className="absolute inset-0" style={{ transform: "scale(1.18)" }} aria-hidden>
        <Stars count={18} seed={44} baseSize={2.4} drift={11} colors={STAR_COLORS} glow />
      </div>
      <div className="absolute inset-0" style={{ transform: "scale(1.3)" }} aria-hidden>
        <Stars count={8} seed={77} baseSize={4.2} drift={7} colors={NEAR_STAR_COLORS} glow />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {!gate ? (
          <div key="card" className="animate-gal-card relative w-full">
            <div
              aria-hidden
              className="animate-gal-glow pointer-events-none absolute -inset-4 rounded-[40px] bg-[radial-gradient(62%_62%_at_50%_0%,rgba(228,66,151,0.24),transparent_72%)] blur-xl"
            />
            <div
              className={
                "gal-card relative z-0 rounded-[30px] px-6 py-10 text-center transition-shadow duration-500 sm:px-9" +
                (entering ? " gal-card-intense" : "")
              }
            >
              <div className="relative my-1">
                <h1
                  className="animate-gal-title text-center font-['Georgia',serif] text-[34px] font-semibold leading-tight text-[#2e0b33] sm:text-[38px]"
                  style={{ textShadow: "0 0 24px rgba(228,66,151,0.35)" }}
                >
                  {coupleTitle}
                </h1>
                <span className="animate-heartbeat absolute -right-1 top-0 text-sm text-[#e44297]">✦</span>
                <span
                  className="animate-heartbeat absolute -left-1 bottom-1 text-xs text-[#f0b25e]"
                  style={{ animationDelay: "-0.6s" }}
                >
                  ✦
                </span>
              </div>

              <FloatingHearts intense={entering} />

              <div className="animate-gal-couple relative mx-auto mt-4 w-52 overflow-hidden rounded-[26px] bg-[#fff6fb]/80 ring-1 ring-[#e44297]/20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_30%,rgba(228,66,151,0.18),transparent_75%)]"
                />
                <LoveDuo />
              </div>

              <p className="animate-gal-title mt-6 text-center text-[11px] font-mono uppercase tracking-[0.34em] text-[#a24a7f]/85">
                {subtitle}
              </p>

              <div className="animate-gal-title mt-7 text-center">
                <button
                  type="button"
                  onClick={enter}
                  className="animate-gal-btn inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#e44297] via-[#f880be] to-[#f0b25e] px-9 text-[13px] font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:scale-[1.04] hover:brightness-110 hover:saturate-110 active:scale-[0.98] active:brightness-100"
                >
                  {enterLabel}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-gal-title space-y-6 text-center">{children}</div>
        )}
      </div>

      {/* cinematic light expansion on enter */}
      {entering ? (
        <div
          aria-hidden
          className="animate-gal-expand pointer-events-none absolute left-1/2 top-1/2 z-20 h-[46vw] w-[46vw] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,228,244,0.95) 0%, rgba(228,66,151,0.4) 30%, rgba(240,178,94,0.25) 55%, transparent 76%)",
          }}
        />
      ) : null}
    </main>
  );
}