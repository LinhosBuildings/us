"use client";

import { useActionState } from "react";
import { createRelationship, type SetupState } from "@/lib/server/relationship";
import { Card, SectionLabel, Input, Textarea, Button, Field } from "@/components/ui";

export default function SetupPage() {
  const [state, formAction, pending] = useActionState<SetupState, FormData>(createRelationship, {});

  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Step one</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">Create your universe</h2>
      <p className="mt-1 text-sm text-fog">
        This universe belongs to two people — you and the person you invite. You&rsquo;ll get a private code to share.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <Field label="Your partner's first name" hint="Just the first name is fine">
          <Input name="partnerName" placeholder="e.g. Biggy" required autoFocus />
        </Field>

        <Field label="When did it start?" hint='The first day you count as "us"'>
          <Input name="startDate" type="date" required />
        </Field>

        <Field label="Universe name (optional)" hint="Default: first names">
          <Input name="title" placeholder="e.g. Our Universe" maxLength={120} />
        </Field>

        <Field label="A short description (optional)">
          <Textarea name="description" rows={2} maxLength={500} placeholder="A few words about what this space is for" />
        </Field>

        {state.error ? <p className="text-[13px] text-ember">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create our universe"}
        </Button>
      </form>
    </Card>
  );
}