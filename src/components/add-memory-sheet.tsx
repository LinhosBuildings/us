"use client";

import { useState, useTransition } from "react";
import { createMemory } from "@/lib/server/memories";
import { Button, Input, Textarea, Field, Pill } from "@/components/ui";
import { MOODS, type MemoryKind } from "@/lib/types";

const KINDS: { value: MemoryKind; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "text", label: "Memory" },
  { value: "conversation", label: "Conversation" },
  { value: "milestone", label: "Milestone" },
  { value: "little-thing", label: "Little thing" },
  { value: "place", label: "Place" },
  { value: "voice", label: "Voice note" },
  { value: "video", label: "Video" },
];

export function AddMemorySheet({
  open,
  onClose,
  chapters,
}: {
  open: boolean;
  onClose: () => void;
  chapters?: { id: string; title: string }[];
}) {
  const [kind, setKind] = useState<MemoryKind>("text");
  const [mood, setMood] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("kind", kind);
    if (mood) formData.set("mood", mood);
    if (chapterId) formData.set("chapterId", chapterId);
    startTransition(async () => {
      const result = await createMemory({}, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-midnight/70 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-panel p-6 shadow-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium text-ivory">Add a memory</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-fog hover:bg-white/5 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="What is it?">
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  type="button"
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                    kind === k.value
                      ? "border-champagne/50 bg-champagne-faint/40 text-champagne-soft"
                      : "border-line text-fog hover:text-ink"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="When did it happen?" hint="Default: today">
            <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </Field>

          <Field label="Title">
            <Input name="title" placeholder={`What happened?`} required maxLength={200} />
          </Field>

          <Field label="The story" hint="Speak naturally. It belongs here.">
            <Textarea name="description" rows={4} maxLength={6000} placeholder="A few lines are enough — the feeling matters more than the detail." />
          </Field>

          <Field label="Where?">
            <Input name="locationName" placeholder="e.g. The coffee shop on Elm" maxLength={160} />
          </Field>

          <Field label="Who was there?">
            <Input name="people" placeholder="Comma-separated names" />
          </Field>

          <Field label="Tags">
            <Input name="tags" placeholder="first-date, rain, karaoke" />
          </Field>

          <Field label="Mood" hint="Optional">
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                    mood === m.value
                      ? "border-champagne/50 bg-champagne-faint/40 text-champagne-soft"
                      : "border-line text-mist hover:text-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Field>

          {chapters && chapters.length > 0 ? (
            <Field label="Chapter (optional)">
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full rounded-xl border border-line bg-void/60 px-4 py-2.5 text-sm text-ink focus:border-champagne/50 focus:outline-none"
              >
                <option value="">— No chapter —</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <textarea hidden name="mediaIds" readOnly value="" />
            <textarea hidden name="neverTold" readOnly value="" />
            <span className="text-[11px] text-mist">Media uploads arrive in the next step.</span>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Save memory"}
            </Button>
          </div>
          {error ? <p className="text-[13px] text-ember">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}