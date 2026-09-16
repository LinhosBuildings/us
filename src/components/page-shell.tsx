"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MODE: Record<string, string> = {
  "/home": "animate-page-a",
  "/story": "animate-page-b",
  "/memories": "animate-page-c",
  "/messages": "animate-page-d",
  "/letters": "animate-page-b",
  "/words": "animate-page-e",
  "/world": "animate-page-c",
  "/future": "animate-page-d",
  "/settings": "animate-page-a",
  "/survived": "animate-page-e",
};

function modeFor(pathname: string): string {
  const exact = MODE[pathname];
  if (exact) return exact;
  for (const [prefix, mode] of Object.entries(MODE)) {
    if (prefix.length > 1 && pathname.startsWith(prefix)) return mode;
  }
  return "animate-page-a";
}

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={cn("min-h-0", modeFor(pathname))}>
      {children}
    </div>
  );
}