"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const BUBBLES = ["💗", "💖", "✨", "💞", "💛", "💘", "🌸"];

const SKIN_M = "#7A4F2E";
const SKIN_M_D = "#5F3A22";
const SKIN_W = "#C08B5A";
const SKIN_W_D = "#A4713F";
const HAIR_M = "#241327";
const HAIR_W = "#3A2033";
const SHIRT = "#4A0D4E";
const SHIRT_HI = "#6B1460";
const JEANS = "#3A3350";
const SHOE = "#1E1130";
const DRESS_A = "#E44297";
const DRESS_B = "#A84FB0";
const TIGHTS = "#4A2A45";
const GOLD = "#F0B25E";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ManBody() {
  return (
    <g className="kiss-body-left">
      <ellipse cx="76" cy="293" rx="54" ry="7" fill="rgba(46,11,51,0.16)" />
      {/* legs */}
      <rect x="50" y="150" width="14" height="136" rx="7" fill={JEANS} />
      <rect x="88" y="150" width="14" height="136" rx="7" fill={JEANS} />
      {/* shoes */}
      <rect x="42" y="282" width="25" height="13" rx="6" fill={SHOE} />
      <rect x="80" y="282" width="25" height="13" rx="6" fill={SHOE} />
      {/* torso */}
      <rect x="48" y="62" width="56" height="98" rx="20" fill={SHIRT} />
      <rect x="52" y="66" width="48" height="26" rx="13" fill={SHIRT_HI} />
      <rect x="72" y="52" width="8" height="13" rx="4" fill={SKIN_M} />
      {/* head + hair */}
      <g className="kiss-head-left">
        <circle cx="76" cy="38" r="28" fill={HAIR_M} />
        <path d="M48,40 C 48,12 104,12 104,40 A 28 28 0 0 1 48,40 Z" fill={HAIR_M} />
        <circle cx="78" cy="45" r="24" fill={SKIN_M} />
        <ellipse cx="102" cy="44" rx="4.5" ry="7" fill={SKIN_M} />
        {/* facing right — eyes closed, smiling */}
        <path d="M86,33 A 3 3 0 0 1 92,33" stroke={SKIN_M_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M95,40 A 3 3 0 0 1 101,40" stroke={SKIN_M_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M84,51 Q 90,55 96,51" stroke={SKIN_M_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="93" cy="48" rx="3.4" ry="2.1" fill="rgba(228,66,151,0.35)" />
      </g>
    </g>
  );
}

function ManFarArm() {
  return (
    <g className="kiss-body-left">
      {/* his left arm wraps behind her back */}
      <path d="M54,88 C 24,132 70,200 108,212" stroke={SKIN_M_D} strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="213" r="9" fill={SKIN_M_D} />
    </g>
  );
}

function ManNearArm() {
  return (
    <g className="kiss-body-left">
      {/* his right arm hugs her waist in front */}
      <path d="M102,84 C 150,118 182,158 204,192" stroke={SKIN_M} strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="207" cy="195" r="9" fill={SKIN_M} />
    </g>
  );
}

function WomanBody() {
  return (
    <g className="kiss-body-right">
      <ellipse cx="244" cy="293" rx="52" ry="7" fill="rgba(46,11,51,0.16)" />
      {/* legs + shoes */}
      <rect x="226" y="196" width="13" height="88" rx="7" fill={TIGHTS} />
      <rect x="258" y="196" width="13" height="88" rx="7" fill={TIGHTS} />
      <rect x="220" y="282" width="23" height="12" rx="6" fill={SHOE} />
      <rect x="252" y="282" width="23" height="12" rx="6" fill={SHOE} />
      {/* dress */}
      <path d="M200,124 C 206,168 182,204 244,204 C 306,204 282,168 288,124 L 288,74 C 288,58 272,52 244,52 C 216,52 200,58 200,74 Z" fill="url(#dressGrad)" />
      <path d="M200,124 C 206,168 182,204 244,204" stroke="rgba(255,255,255,0.28)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="240" y="56" width="8" height="13" rx="4" fill={SKIN_W} />
      {/* head + hair */}
      <g className="kiss-head-right">
        <circle cx="244" cy="34" r="27" fill={HAIR_W} />
        <circle cx="244" cy="6" r="8" fill={HAIR_W} />
        <path d="M218,46 C 218,16 270,16 270,46 A 27 27 0 0 1 218,46 Z" fill={HAIR_W} />
        <circle cx="242" cy="43" r="22" fill={SKIN_W} />
        <ellipse cx="226" cy="42" rx="4" ry="6.5" fill={SKIN_W} />
        {/* facing left — eyes closed, smiling */}
        <path d="M236,32 A 3 3 0 0 0 230,32" stroke={SKIN_W_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M227,39 A 3 3 0 0 0 221,39" stroke={SKIN_W_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M238,50 Q 232,54 226,50" stroke={SKIN_W_D} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="229" cy="47" rx="3.2" ry="2" fill="rgba(228,66,151,0.35)" />
        <path d="M244,52 L 244,72" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
  );
}

function WomanFarArm() {
  return (
    <g className="kiss-body-right">
      {/* her right arm wraps behind his back */}
      <path d="M286,88 C 306,136 252,202 212,208" stroke={SKIN_W_D} strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="210" cy="209" r="8.5" fill={SKIN_W_D} />
    </g>
  );
}

function WomanNearArm() {
  return (
    <g className="kiss-body-right">
      {/* her left arm hugs his waist in front */}
      <path d="M206,82 C 172,120 152,154 140,184" stroke={SKIN_W} strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="137" cy="187" r="8.5" fill={SKIN_W} />
    </g>
  );
}

export function LoveDuo({
  mode = "kiss",
  className,
}: {
  mode?: "float" | "kiss";
  className?: string;
}) {
  const bubbles = useMemo(() => {
    const rnd = mulberry32(11);
    return Array.from({ length: 10 }, (_, i) => ({
      left: 4 + rnd() * 90,
      top: 4 + rnd() * 80,
      emoji: BUBBLES[i % BUBBLES.length],
      size: 13 + rnd() * 15,
      delay: (rnd() * 3.6).toFixed(2),
      dur: (3.2 + rnd() * 2.2).toFixed(2),
    }));
  }, []);

  return (
    <div className={cn("pointer-events-none relative select-none", className)} aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="animate-love-pop absolute"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            fontSize: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        >
          {b.emoji}
        </span>
      ))}

      <svg viewBox="0 0 320 300" className="mx-auto w-[min(320px,88%)] overflow-visible">
        <defs>
          <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={DRESS_A} />
            <stop offset="1" stopColor={DRESS_B} />
          </linearGradient>
        </defs>

        <ManFarArm />
        <WomanFarArm />
        <ManBody />
        <WomanBody />
        <ManNearArm />
        <WomanNearArm />
      </svg>

      <span className="animate-kiss-mark absolute left-1/2 top-[13%] -translate-x-1/2 text-3xl">💋</span>
    </div>
  );
}