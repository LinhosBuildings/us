"use client";

import { useEffect, useMemo, useState } from "react";
import { computeCounter, type RelationshipCounter } from "@/lib/relationship-counter";
import { cn } from "@/lib/utils";

export function RelationshipCounter({
  startDate,
  initial,
  className,
  align = "center",
}: {
  startDate: string;
  /** Optional server-computed snapshot so hydration always matches (avoids
   *  second-boundary and timezone mismatches). Falls back to local compute. */
  initial?: RelationshipCounter;
  className?: string;
  align?: "center" | "left";
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // First (server + hydration) render uses the exact server snapshot. Once the
  // first interval tick fires we switch to live computation — post-hydration
  // value changes are fine, only the initial markup must match.
  const c = useMemo(
    () => (now === null && initial ? initial : computeCounter(startDate, now ?? Date.now())),
    [startDate, now, initial]
  );

  const pills = [
    { value: String(c.years), label: "years" },
    { value: String(c.months), label: "months" },
    { value: String(c.days), label: "days" },
    { value: String(c.hours).padStart(2, "0"), label: "hours" },
    { value: String(c.minutes).padStart(2, "0"), label: "minutes" },
    { value: String(c.seconds).padStart(2, "0"), label: "seconds" },
  ];

  return (
    <div className={cn("space-y-4", align === "left" ? "text-left" : "text-center", className)}>
      <div className={cn("space-y-1", align === "left" ? "text-left" : "text-center")}>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">our orbit counts</p>
        <p className="font-display text-[44px] font-bold leading-none tabular-nums sm:text-6xl">
          <span
            className="bg-gradient-to-r from-[#e44297] via-[#f0b25e] to-[#e44297] bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 2px 18px rgba(228,66,151,0.45))" }}
          >
            {c.totalDays}
          </span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.28em] text-fog">days of us — every second counted</p>
      </div>

      <div
        className={cn(
          "flex items-stretch",
          align === "left" ? "justify-start" : "justify-center",
          "gap-1 sm:gap-2.5"
        )}
      >
        {pills.map((cell, i) => (
          <div key={cell.label} className="flex items-center gap-1 sm:gap-2.5">
            {i > 0 ? (
              <span className="pb-5 font-display text-lg font-bold text-champagne/50">:</span>
            ) : null}
            <div className="flex flex-col items-center">
              <span className="min-w-[2ch] rounded-xl border border-[#e44297]/25 bg-white/60 px-2 py-1.5 font-display text-lg font-bold tabular-nums text-[#2e0b33] sm:min-w-[3.5ch] sm:text-2xl">
                {cell.value}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-mist sm:text-[10px]">
                {cell.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}