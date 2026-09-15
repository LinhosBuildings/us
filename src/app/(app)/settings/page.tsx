import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { logout } from "@/lib/server/account";
import { Card, SectionLabel, Avatar, Pill } from "@/components/ui";

export default async function SettingsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);

  const members = rel?.members ?? [];
  const partner = members.find((m) => m.id !== user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div>
        <SectionLabel>Your universe</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Settings</h1>
      </div>

      {/* profile */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} url={user.avatarUrl} size={56} />
          <div>
            <h3 className="text-lg text-ivory">{user.name}</h3>
            <p className="text-sm text-mist">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">You</Pill>
          <Pill tone="sage">{partner?.name ?? "Their side"}</Pill>
        </div>
      </Card>

      {/* relationship */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between">
          <SectionLabel>Relationship</SectionLabel>
          <Pill>code: {rel?.code}</Pill>
        </div>
        <p className="text-sm text-fog">
          Your universe name is <span className="text-ivory">{rel?.name}</span>. Started {rel ? new Date(rel.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}.
        </p>
      </Card>

      {/* demo notice */}
      <Card className="p-6 space-y-3">
        <SectionLabel>About your universe</SectionLabel>
        <p className="text-sm leading-relaxed text-fog">
          This is a private space for exactly two people. Data lives inside your universe — in demo mode it&rsquo;s
          in-memory (resets on restart); in production it&rsquo;s stored in your own database, end to end yours.
        </p>
        <p className="text-xs text-mist">
          Everyone&rsquo;s universe is isolated. No one can browse your memories, letters, confessions, or capsules
          unless they belong to your code.
        </p>
      </Card>

      {/* account actions */}
      <Card className="p-6 space-y-4">
        <SectionLabel>Account</SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-full border border-ember/40 px-3.5 text-[13px] text-ember transition-colors hover:bg-ember/10"
            >
              Sign out
            </button>
          </form>
          <Pill>Change password</Pill>
          <Pill>Export archive</Pill>
        </div>
        <p className="text-[11px] text-mist">Security: password hashing via scrypt, sessions are HMAC-signed cookies, and every action re-verifies you belong to this relationship.</p>
      </Card>
    </div>
  );
}