import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { computeCounter } from "@/lib/relationship-counter";
import { Avatar } from "@/components/ui";
import { SideMenuProvider, SideMenuTrigger, type SideMenuSection } from "@/components/side-menu";

const SECTIONS: SideMenuSection[] = [
  { href: "/home", label: "Our Universe", hint: "the whole of us" },
  { href: "/story", label: "Our Story", hint: "chapter by chapter" },
  { href: "/memories", label: "Memories", hint: "every kept moment" },
  { href: "/messages", label: "Chat", hint: "just us two" },
  { href: "/words", label: "Our Words", hint: "letters · confessions · words" },
  { href: "/world", label: "Our World", hint: "firsts · places · little things" },
  { href: "/future", label: "The Future", hint: "goals · capsules · forever" },
];

const MOBILE_NAV = [
  { href: "/home", label: "Universe" },
  { href: "/story", label: "Story" },
  { href: "/memories", label: "Memories" },
  { href: "/messages", label: "Chat" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) redirect("/setup");

  const counter = computeCounter(rel.startDate);

  return (
    <div className="flex min-h-dvh flex-col bg-midnight">
      <SideMenuProvider sections={SECTIONS}>
        {/* desktop top bar */}
        <header className="sticky top-0 z-40 hidden border-b border-line bg-midnight/80 backdrop-blur-xl md:block">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
            <Link href="/home" className="mr-2 shrink-0">
              <span className="font-display text-xl font-medium text-gradient-gold">US</span>
            </Link>

            <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
              {SECTIONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-fog transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[10px] text-mist">Day {counter.totalDays}</span>
              <Avatar name={user.name} url={user.avatarUrl} size={32} />
              <SideMenuTrigger />
            </div>
          </div>
        </header>

        {/* mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-midnight/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/home">
            <span className="font-display text-xl font-medium text-gradient-gold">US</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-mist">Day {counter.totalDays}</span>
            <Avatar name={user.name} url={user.avatarUrl} size={30} />
            <SideMenuTrigger />
          </div>
        </header>

        {/* main content */}
        <main className="flex-1 px-4 py-6 md:mx-auto md:w-full md:max-w-6xl md:px-6 md:py-10">{children}</main>

        {/* mobile bottom nav */}
        <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-line bg-midnight/90 backdrop-blur-xl md:hidden">
          <div className="no-scrollbar flex items-center gap-0.5 px-2 py-2">
            {MOBILE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-[11px] text-fog transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </SideMenuProvider>
    </div>
  );
}