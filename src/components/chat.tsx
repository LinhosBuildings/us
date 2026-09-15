"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "@/lib/server/messages";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function Chat({ messages, meId }: { messages: Message[]; meId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);

  const handleSend = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.elements.namedItem("body") as HTMLTextAreaElement | null;
      if (!input || !input.value.trim()) return;
      setPending(true);
      try {
        const fd = new FormData(form);
        await sendChatMessage(fd);
        form.reset();
        router.refresh();
        input.focus();
      } finally {
        setPending(false);
      }
    },
    []
  );

  let lastDay = "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-4 pt-1">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="font-display text-xl text-ivory">No messages yet</p>
              <p className="mt-1 text-sm text-fog">This is your private line. Say something — even if it's just &ldquo;good morning&rdquo;.</p>
            </div>
          </div>
        ) : null}

        {messages.map((m) => {
          const mine = m.authorId === meId;
          const day = new Date(m.createdAt).toDateString();
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id}>
              {showDay ? <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-widest text-mist">{fmtDay(m.createdAt)}</p> : null}
              <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-2.5",
                    mine
                      ? "rounded-br-md border border-champagne/25 bg-champagne-faint"
                      : "rounded-bl-md border border-line bg-panel/60"
                  )}
                >
                  {!mine ? <p className="mb-0.5 text-[10px] font-medium text-champagne/80">{m.authorName}</p> : null}
                  <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ivory">{m.body}</p>
                  <p className="mt-1 text-right font-mono text-[9.5px] text-mist">{fmtTime(m.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="shrink-0 border-t border-line bg-midnight/60 pb-2 pt-3 backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            rows={1}
            maxLength={4000}
            placeholder="Write to them…"
            aria-label="Message"
            className="max-h-36 min-h-11 flex-1 resize-y rounded-2xl border border-line bg-panel/60 px-4 py-2.5 text-[14px] text-ivory placeholder:text-mist focus:border-champagne/40 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-champagne px-5 text-sm font-medium text-midnight transition-colors hover:bg-champagne-soft disabled:opacity-50"
          >
            {pending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}