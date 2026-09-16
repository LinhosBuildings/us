"use client";

import { useMemo } from "react";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COLORS = ["#e44297", "#f880be", "#f0b25e", "#8f5fd6", "#f6c4ea", "#c9a3e6"];
const HEART_COLORS = ["#e44297", "#f880be", "#f0b25e", "#8f5fd6"];

export function Lovefield({ stars = 150, hearts = 14 }: { stars?: number; hearts?: number }) {
  const rand = useMemo(() => mulberry32(7), []);

  const starField = useMemo(
    () =>
      Array.from({ length: stars }, (_, i) => {
        const size = 2 + rand() * 4;
        return {
          id: i,
          top: rand() * 100,
          left: rand() * 100,
          size,
          color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
          opacity: 0.35 + rand() * 0.65,
          duration: 2.6 + rand() * 4,
          delay: -rand() * 6,
        };
      }),
    [stars, rand]
  );

  const heartField = useMemo(
    () =>
      Array.from({ length: hearts }, (_, i) => ({
        id: i,
        left: rand() * 100,
        delay: -rand() * 14,
        duration: 12 + rand() * 10,
        scale: 0.5 + rand() * 0.9,
        opacity: 0.25 + rand() * 0.5,
        color: HEART_COLORS[Math.floor(rand() * HEART_COLORS.length)],
      })),
    [hearts, rand]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {starField.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full star-point animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            color: s.color,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {heartField.map((h) => (
        <span
          key={h.id}
          className="absolute select-none leading-none animate-heart-float"
          style={{
            top: "-14%",
            left: `${h.left}%`,
            fontSize: `${14 + h.scale * 18}px`,
            color: h.color,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            ["--s" as string]: h.scale,
            ["--o" as string]: h.opacity,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}