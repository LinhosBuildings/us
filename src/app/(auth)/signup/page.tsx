"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type SignupState } from "@/lib/server/account";
import { Card, SectionLabel, Input, Button } from "@/components/ui";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, {});

  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Create your universe</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">Start something private</h2>
      <p className="mt-1 text-sm text-fog">Just you and one other person. All yours. No feeds, no likes, no noise.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <Input name="name" placeholder="Your name" required autoFocus autoComplete="name" />
        <Input name="email" type="email" placeholder="you@email.com" required autoComplete="email" />
        <Input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />

        {state.error ? <p className="text-[13px] text-ember">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-fog">
        Already have an account? <Link href="/login" className="text-champagne hover:text-champagne-soft">Sign in</Link>
      </p>
    </Card>
  );
}