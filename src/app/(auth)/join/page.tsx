"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinRelationship } from "@/lib/server/relationship";
import { Card, SectionLabel, Input, Button } from "@/components/ui";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<{ code: string; relationshipName: string; invitedBy: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // lookup as user types
  useEffect(() => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setInfo(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lookup-code?code=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data?.relationshipName) {
            setInfo(data);
            setError(null);
          } else {
            setInfo(null);
          }
        }
      } catch {
        if (!cancelled) setInfo(null);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [code]);

  function handleJoin() {
    setError(null);
    startTransition(async () => {
      const result = await joinRelationship(code.trim());
      if (result?.error) setError(result.error);
      else router.push("/home");
    });
  }

  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Join a universe</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">Enter the invite code</h2>
      <p className="mt-1 text-sm text-fog">Your partner shared a 6-digit code with you. Paste or type it below.</p>

      <div className="mt-8 space-y-4">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 3H1XOY"
          autoFocus
          maxLength={8}
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.trim().length >= 4) handleJoin();
          }}
        />

        {info ? (
          <div className="rounded-xl border border-champagne/30 bg-champagne-faint/30 p-4 text-center">
            <p className="text-sm text-ivory">{info.invitedBy} is inviting you into</p>
            <p className="font-display text-xl font-medium text-champagne-soft">{info.relationshipName}</p>
          </div>
        ) : null}

        {error ? <p className="text-[13px] text-ember">{error}</p> : null}

        <Button
          className="w-full"
          disabled={pending || code.trim().length < 4}
          onClick={handleJoin}
        >
          {pending ? "Joining…" : "Join this universe"}
        </Button>
      </div>

      <p className="mt-4 text-center text-[13px] text-mist">Codes are case-insensitive.</p>
    </Card>
  );
}