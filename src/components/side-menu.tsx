"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SideMenuSection {
  href: string;
  label: string;
  hint?: string;
  icon?: string;
  children?: SideMenuSection[];
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
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-white/50 text-[14px] text-ivory transition-all hover:scale-105 hover:border-champagne/60 hover:text-champagne",
        className
      )}
    >
      ♥
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <SideMenuContext.Provider value={{ open, setOpen }}>
      {children}

      {open ? <div className="fixed inset-0 z-[55] bg-[#3b0f21]/45 backdrop-blur-sm" onClick={() => setOpen(false)} /> : null}

      <aside
        aria-label="Sections"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-[60] flex w-[86%] max-w-sm transform flex-col border-r border-line-strong bg-white/90 backdrop-blur-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display text-lg font-medium text-gradient-love">US ♡</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ivory transition-colors hover:border-champagne/60 hover:text-champagne"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain py-4">
          <ol className="space-y-1.5 px-3">
            {sections.map((s, i) => {
              const active = isActive(s.href);
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "lift flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                      active
                        ? "border-champagne/50 bg-champagne-faint text-champagne"
                        : "border-transparent text-fog hover:bg-white/70 hover:text-ivory"
                    )}
                  >
                    <span className="w-6 shrink-0 text-center text-[15px] text-champagne">{s.icon ?? "♡"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{s.label}</span>
                      {s.hint ? <span className="block text-[10px] text-mist">{s.hint}</span> : null}
                    </span>
                    {active ? <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-champagne animate-heartbeat" /> : null}
                  </Link>

                  {s.children && s.children.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 border-l border-line-strong/60 pl-6 ml-7">
                      {s.children.map((c) => {
                        const cActive = isActive(c.href);
                        return (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] transition-colors",
                                cActive ? "text-champagne font-medium bg-champagne-faint" : "text-fog hover:text-ivory hover:bg-white/60"
                              )}
                            >
                              <span aria-hidden className={cn("h-1 w-1 rounded-full", cActive ? "bg-champagne" : "bg-mist")} />
                              <span className="truncate">{c.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {i < sections.length - 1 && s.children && s.children.length > 0 ? (
                    <div className="my-2 ml-7 h-px bg-line" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-line px-5 py-3">
          <div className="grid grid-cols-2 gap-2">
            <SideMenuLink href="/search" label="Search" />
            <SideMenuLink href="/settings" label="Settings" />
          </div>
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-mist">
            made with <span className="text-champagne">♥</span> for just the two of us
          </p>
        </div>
      </aside>

      {/* floating edge tab (touch screens) */}
      <button
        type="button"
        aria-label="Open sections"
        onClick={() => setOpen(true)}
        className="fixed left-0 top-1/2 z-[60] flex h-24 w-9 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-r-xl border border-l-0 border-line-strong bg-white/85 font-mono text-[9px] uppercase tracking-widest text-champagne backdrop-blur-md transition-colors hover:text-champagne-soft md:hidden"
      >
        <span aria-hidden className="animate-heartbeat">♥</span>
        <span className="[writing-mode:vertical-rl]">sections</span>
      </button>
    </SideMenuContext.Provider>
  );
}

function SideMenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line px-3 py-2 text-center text-[12.5px] font-medium text-fog transition-colors hover:border-champagne/50 hover:text-champagne"
    >
      {label}
    </Link>
  );
}