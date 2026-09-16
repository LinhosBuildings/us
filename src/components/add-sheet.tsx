"use client";

import { useState, useRef, useTransition, ReactNode } from "react";
import { uploadMedia } from "@/lib/server/media";
import { Button, Input, Textarea, Field } from "@/components/ui";

export type SheetField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select" | "list";
  hint?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  rows?: number;
};

type AddSheetAction = (prev: { error?: string }, formData: FormData) => Promise<{ error?: string } | undefined | void>;

export function AddSheet({
  trigger,
  title,
  eyebrow,
  submitLabel,
  fields,
  action,
  media = false,
}: {
  trigger: ReactNode;
  title: string;
  eyebrow?: string;
  submitLabel: string;
  fields: SheetField[];
  action: AddSheetAction;
  media?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<{ id: string; url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  function close() {
    setOpen(false);
    setError(null);
    setMediaList([]);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadMedia(fd);
      if (result.error) {
        setError(result.error);
        continue;
      }
      if (result.mediaId) {
        setMediaList((prev) => [...prev, { id: result.mediaId!, url: result.url ?? "", name: file.name }]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (media) formData.set("mediaIds", mediaList.map((m) => m.id).join(","));
    startTransition(async () => {
      const result = await action({}, formData);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        close();
        window.location.reload();
      }
    });
  }

  const selectCls =
    "w-full rounded-xl border border-line bg-void/60 px-4 py-2.5 text-sm text-ink focus:border-champagne/50 focus:outline-none";

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open ? (
        <div className="fixed inset-0 z-[85] flex items-end justify-center bg-midnight/70 backdrop-blur-sm md:items-center" onClick={close}>
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-panel p-6 shadow-2xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong md:hidden" />
            <div className="mb-5 flex items-center justify-between">
              <div>
                {eyebrow ? <p className="font-mono text-[10px] uppercase tracking-widest text-champagne/60">{eyebrow}</p> : null}
                <h2 className="font-display text-2xl font-medium text-ivory">{title}</h2>
              </div>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-fog hover:bg-white/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((f) => {
                const common = {
                  name: f.name,
                  required: f.required,
                  defaultValue: f.defaultValue,
                  maxLength: f.maxLength,
                };
                if (f.type === "textarea") {
                  return (
                    <Field key={f.name} label={f.label} hint={f.hint}>
                      <Textarea {...common} rows={f.rows ?? 4} maxLength={f.maxLength ?? 6000} placeholder={f.placeholder} />
                    </Field>
                  );
                }
                if (f.type === "date") {
                  return (
                    <Field key={f.name} label={f.label} hint={f.hint}>
                      <Input {...common} type="date" />
                    </Field>
                  );
                }
                if (f.type === "select") {
                  return (
                    <Field key={f.name} label={f.label} hint={f.hint}>
                      <select {...common} className={selectCls}>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  );
                }
                if (f.type === "list") {
                  return (
                    <Field key={f.name} label={f.label} hint={f.hint ?? "Separate each with a comma"}>
                      <Input {...common} type="text" placeholder={f.placeholder} />
                    </Field>
                  );
                }
                return (
                  <Field key={f.name} label={f.label} hint={f.hint}>
                    <Input {...common} type="text" placeholder={f.placeholder} />
                  </Field>
                );
              })}

              {media ? (
                <Field label="Media" hint="Photos, videos — attach to this entry">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    multiple
                    onChange={(e) => void handleFiles(e.target.files)}
                    className="block w-full text-[13px] text-mist file:mr-3 file:rounded-full file:border-0 file:bg-champagne-faint/40 file:px-3 file:py-1.5 file:text-[12px] file:text-champagne-soft hover:file:bg-champagne-faint/70"
                  />
                  {uploading ? <p className="mt-2 text-[12px] text-mist">Uploading…</p> : null}
                  {mediaList.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {mediaList.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-void/40 px-3 py-2">
                          {m.url && !m.url.startsWith("data:video") && !m.url.includes("/video") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-[10px] text-mist">MEDIA</span>
                          )}
                          <span className="flex-1 truncate text-[13px] text-ivory">{m.name}</span>
                          <button
                            type="button"
                            onClick={() => setMediaList((prev) => prev.filter((x) => x.id !== m.id))}
                            className="text-[12px] text-fog hover:text-ember"
                            aria-label={`Remove ${m.name}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Field>
              ) : null}

              <div className="flex items-center justify-between gap-2">
                {media ? <textarea hidden name="mediaIds" readOnly value={mediaList.map((m) => m.id).join(",")} /> : null}
                <span className="text-[11px] text-mist">
                  {media ? (mediaList.length > 0 ? `${mediaList.length} attached` : "No media") : "Private between the two of you"}
                </span>
                <Button type="submit" size="sm" disabled={pending || uploading}>
                  {pending ? "Saving…" : submitLabel}
                </Button>
              </div>
              {error ? <p className="text-[13px] text-ember">{error}</p> : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}