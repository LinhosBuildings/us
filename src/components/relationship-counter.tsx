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

  const cells: { value: string; label: string }[] = [
    { value: String(c.years), label: "years" },
    { value: String(c.months), label: "months" },
    { value: String(c.days), label: "days" },
    { value: String(c.hours).padStart(2, "0"), label: "hours" },
    { value: String(c.minutes).padStart(2, "0"), label: "minutes" },
    { value: String(c.seconds).padStart(2, "0"), label: "seconds" },
  ];

  return (
    <div className={cn("space-y-3", align === "left" ? "text-left" : "text-center", className)}>
      <div
        className={cn(
          "flex items-stretch",
          align === "left" ? "justify-start" : "justify-center",
          "gap-1.5 sm:gap-3"
        )}
      >
        {cells.map((cell, i) => (
          <div key={cell.label} className="flex items-center gap-1.5 sm:gap-3">
            {i > 0 ? <span className="pb-4 font-mono text-[10px] text-champagne/60">:</span> : null}
            <div className="flex flex-col items-center">
              <span className="min-w-[2ch] rounded-lg border border-line bg-void/70 px-1.5 py-1.5 font-mono text-sm tabular-nums text-ivory sm:min-w-[3ch] sm:text-lg md:text-xl">
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