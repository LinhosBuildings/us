import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { logout, updateProfile } from "@/lib/server/account";
import { updateRelationship } from "@/lib/server/relationship";
import { Card, SectionLabel, Avatar, Pill, Field, Input } from "@/components/ui";

export default async function SettingsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);

  const members = rel?.members ?? [];
  const partner = members.find((m) => m.id !== user.id);
  const my = members.find((m) => m.id === user.id);

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
            <p className="text-sm text-mist">{user.email ? user.email : "Email not set yet"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">You</Pill>
          <Pill tone="sage">{partner?.name ?? "Their side"}</Pill>
        </div>
      </Card>

      {/* edit profile + contacts */}
      <Card className="p-6 space-y-5">
        <SectionLabel>Your details</SectionLabel>
        <form action={updateProfile} className="space-y-4">
          <Field label="Display name" hint="Shown to your partner">
            <Input name="name" defaultValue={user.name} required />
          </Field>
          <Field label="WhatsApp" hint="Optional — only you two see this">
            <Input name="whatsapp" defaultValue={my?.whatsapp ?? ""} placeholder="+234 …" />
          </Field>
          <Field label="GitHub" hint="Optional">
            <Input name="github" defaultValue={my?.github ?? ""} placeholder="username" />
          </Field>
          <Field label="Instagram" hint="Optional">
            <Input name="instagram" defaultValue={my?.instagram ?? ""} placeholder="username" />
          </Field>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full bg-champagne px-4 text-sm font-medium text-midnight transition-colors hover:bg-champagne-soft"
          >
            Save details
          </button>
        </form>
      </Card>

      {/* relationship */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between">
          <SectionLabel>Relationship</SectionLabel>
          <Pill>code: {rel?.code}</Pill>
        </div>
        <p className="text-sm text-fog">
          Your universe name is <span className="text-ivory">{rel?.name}</span>.
        </p>
        <form action={updateRelationship} className="space-y-3">
          <Field
            label="The day we became us"
            hint="Drives your counter, anniversary and timeline"
          >
            <Input
              name="startDate"
              type="date"
              defaultValue={rel ? rel.startDate.slice(0, 10) : ""}
            />
          </Field>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full border border-champagne/30 px-4 text-sm text-champagne-soft transition-colors hover:bg-champagne/10"
          >
            Save the date
          </button>
        </form>
      </Card>

      {/* members */}
      <Card className="p-6 space-y-4">
        <SectionLabel>Who belongs here</SectionLabel>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar name={m.name} url={m.avatarUrl} size={36} />
              <div className="flex-1">
                <p className="text-sm text-ivory">
                  {m.name}
                  {m.isOwner ? <span className="ml-2 text-[11px] font-mono uppercase tracking-wider text-champagne/70">keeper</span> : null}
                </p>
                <p className="text-[11px] text-mist">
                  {m.email ? m.email : "Email to be added"}{" "}
                  {[m.whatsapp, m.github, m.instagram].filter(Boolean).length > 0 ? "· " + [m.whatsapp, m.github, m.instagram].filter(Boolean).join(" · ") : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* privacy note */}
      <Card className="p-6 space-y-3">
        <SectionLabel>About your universe</SectionLabel>
        <p className="text-sm leading-relaxed text-fog">
          This is a private space for exactly two people. Data lives inside your universe — in demo mode it&rsquo;s
          in-memory (resets on restart); in production it&rsquo;s stored in your own Supabase Postgres, end to end yours.
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
          <a
            href="/api/export"
            className="inline-flex h-8 items-center rounded-full border border-line-strong px-3.5 text-[13px] text-ink transition-colors hover:border-champagne/40 hover:text-champagne-soft"
          >
            Download backup (JSON)
          </a>
        </div>
        <p className="text-[11px] text-mist">
          Your partner joins with your universe code (<span className="font-mono text-champagne">{rel?.code}</span>). Security:
          password hashing via scrypt, sessions are HMAC-signed cookies, and every action re-verifies you belong to this relationship.
        </p>
      </Card>
    </div>
  );
}