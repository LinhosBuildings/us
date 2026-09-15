import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Chat } from "@/components/chat";
import { SectionLabel } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const messages = await store.listMessages(rel.id);
  const partner = rel.members.find((m) => m.id !== user.id)?.name ?? "them";

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-11rem)]">
      <div className="mb-3">
        <SectionLabel>Messages</SectionLabel>
        <h1 className="font-display text-2xl font-medium text-ivory">Us, talking</h1>
        <p className="max-w-lg text-sm text-fog">
          The running conversation between just the two of you — {partner} and you.
        </p>
      </div>
      <Chat messages={messages} meId={user.id} />
    </div>
  );
}