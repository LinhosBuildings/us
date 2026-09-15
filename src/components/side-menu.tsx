"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SideMenuSection {
  href: string;
  label: string;
  hint?: string;
}

const SideMenuContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export function useSideMenu() {
  return useContext(SideMenuContext);
}

export function SideMenuTrigger({ className }: { className?: string }) {
  const { setOpen } = useSideMenu();
  return (
    <button
      type="button"
      aria-label="Open sections"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-line-strong text-[14px] text-ink transition-colors hover:border-champagne/50 hover:text-champagne-soft",
        className
      )}
    >
      ☰
    </button>
  );
}

export function SideMenuProvider({ sections, children }: { sections: SideMenuSection[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const current = sections.find((s) => pathname === s.href || pathname.startsWith(s.href + "/"))?.href ?? null;

  return (
    <SideMenuContext.Provider value={{ open, setOpen }}>
      {children}

      {open ? <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} /> : null}

      <aside
        aria-label="Sections"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[60] flex w-[82%] max-w-xs transform flex-col border-l border-line-strong bg-abyss/95 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-champagne/70">US — Sections</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-ivory transition-colors hover:border-champagne/50 hover:text-champagne-soft"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain py-3">
          <ol className="space-y-0.5 px-2">
            {sections.map((s, i) => {
              const active = s.href === current;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                      active ? "bg-champagne-faint text-champagne-soft" : "text-fog hover:bg-white/5 hover:text-ivory"
                    )}
                  >
                    <span className="w-5 shrink-0 font-mono text-[10px] text-mist">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{s.label}</span>
                      {s.hint ? <span className="block font-mono text-[9px] uppercase tracking-wider text-mist">{s.hint}</span> : null}
                    </span>
                    {active ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" /> : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-line px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <SideMenuLink href="/search" label="Search" />
            <SideMenuLink href="/settings" label="Settings" />
          </div>
        </div>
      </aside>

      {/* floating edge tab (touch screens) */}
      <button
        type="button"
        aria-label="Open sections"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-[60] flex h-24 w-9 -translate-y-1/2 flex-col items-center justify-center gap-1.5 rounded-l-xl border border-r-0 border-line-strong bg-abyss/90 font-mono text-[9px] uppercase tracking-widest text-champagne-soft backdrop-blur-md transition-colors hover:text-champagne md:hidden"
      >
        <span aria-hidden>☰</span>
        <span className="[writing-mode:vertical-rl]">sections</span>
      </button>
    </SideMenuContext.Provider>
  );
}

function SideMenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-line px-3 py-2 text-center text-[12px] text-fog transition-colors hover:border-champagne/40 hover:text-champagne-soft"
    >
      {label}
    </Link>
  );
}