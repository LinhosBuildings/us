import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { computeCounter } from "@/lib/relationship-counter";
import { Avatar } from "@/components/ui";
import { SideMenuProvider, SideMenuTrigger, type SideMenuSection } from "@/components/side-menu";

const SECTIONS: SideMenuSection[] = [
  { href: "/home", label: "Our Orbit", hint: "the whole of us", icon: "✦" },
  {
    href: "/story",
    label: "How We Happened",
    hint: "chapter by chapter",
    icon: "♡",
    children: [
      { href: "/story", label: "Our Chapters" },
      { href: "/survived", label: "What We Surmounted" },
      { href: "/firsts", label: "Line of Firsts" },
    ],
  },
  {
    href: "/memories",
    label: "Keepsakes",
    hint: "every kept moment",
    icon: "✦",
    children: [
      { href: "/memories", label: "All Our Memories" },
      { href: "/little-things", label: "Little Things" },
    ],
  },
  {
    href: "/messages",
    label: "Sweet Talk",
    hint: "just us two, live",
    icon: "♥",
    children: [
      { href: "/messages", label: "The Chat" },
      { href: "/letters", label: "Love Letters" },
    ],
  },
  {
    href: "/words",
    label: "Words of Us",
    hint: "the things we say",
    icon: "✧",
    children: [
      { href: "/words", label: "Written Between Us" },
      { href: "/open-when", label: "Open When…" },
      { href: "/confessions", label: "Whispered Confessions" },
      { href: "/dictionary", label: "Our Private Dictionary" },
      { href: "/reflections", label: "Then & Now" },
    ],
  },
  {
    href: "/world",
    label: "Our Planet",
    hint: "the places of us",
    icon: "✱",
    children: [
      { href: "/world", label: "Places of Us" },
      { href: "/soundtrack", label: "Our Soundtrack" },
    ],
  },
  {
    href: "/future",
    label: "Forever & Always",
    hint: "dreams, capsules, always",
    icon: "✦",
    children: [
      { href: "/future", label: "The Future Tree" },
      { href: "/time-capsules", label: "Time Capsules" },
      { href: "/anniversary", label: "Our Anniversary" },
      { href: "/forever", label: "Forever" },
    ],
  },
];

const TOP_NAV = [
  { href: "/home", label: "Our Orbit" },
  { href: "/story", label: "How We Happened" },
  { href: "/memories", label: "Keepsakes" },
  { href: "/messages", label: "Sweet Talk" },
  { href: "/words", label: "Words of Us" },
  { href: "/world", label: "Our Planet" },
  { href: "/future", label: "Forever & Always" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) redirect("/setup");

  const counter = computeCounter(rel.startDate);

  return (
    <div className="flex min-h-dvh flex-col">
      <SideMenuProvider sections={SECTIONS}>
        {/* desktop top bar */}
        <header className="sticky top-0 z-40 hidden border-b border-line bg-white/70 backdrop-blur-xl md:block">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
            <Link href="/home" className="mr-2 shrink-0">
              <span className="font-display text-xl font-medium text-gradient-love">US ♡</span>
            </Link>

            <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
              {TOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] text-fog transition-colors hover:bg-white/80 hover:text-ivory"
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
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/70 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/home">
            <span className="animate-heartbeat inline-block font-display text-xl font-medium text-gradient-love">US ♡</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-mist">Day {counter.totalDays}</span>
            <Avatar name={user.name} url={user.avatarUrl} size={30} />
            <SideMenuTrigger />
          </div>
        </header>

        {/* main content */}
        <main className="flex-1 px-4 py-6 md:mx-auto md:w-full md:max-w-6xl md:px-6 md:py-10">{children}</main>
      </SideMenuProvider>
    </div>
  );
}