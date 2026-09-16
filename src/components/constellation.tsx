"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Chapter, Memory, MemoryStatus, Mood } from "@/lib/types";

/* ────────────────────────────────────────────────────────────
   THE BIGGYLINHO UNIVERSE
   Every moment became a star. Every chapter became a
   constellation. Every constellation tells the story of us.
   ──────────────────────────────────────────────────────────── */

interface StarMemory {
  id: string;
  title: string;
  kind: Memory["kind"];
  date: string;
  description: string;
  locationName?: string | null;
  mood?: Mood | null;
  chapterId?: string | null;
  media?: Memory["media"];
  status?: MemoryStatus | null;
  constellationX?: number | null;
  constellationY?: number | null;
}

interface Props {
  memories: StarMemory[];
  chapters?: Chapter[];
  originName?: string;
  originDate?: string;
  originCaption?: string;
  className?: string;
  width?: number;
  height?: number;
}

type Importance = 0 | 1 | 2;
type Family = "warm" | "calm" | "cool";

const ORIGIN_POS = { x: 0.085, y: 0.52 };

// vivid rose + warm gold + deep plum accents (match globals.css)
const ROSE = "228, 66, 151"; // --color-champagne #e44297
const ROSE_SOFT = "248, 128, 190"; // --color-champagne-soft #f880be
const ROSE_MID = "222, 92, 168";
const ROSE_LIGHT = "247, 168, 210";
const ROSE_WHITE = "255, 255, 255";
const ROSE_TITLE = "255, 255, 255";
const GOLD = "240, 178, 94"; // --color-gold #f0b25e
const VIOLET = "143, 95, 214"; // --color-nightsky #8f5fd6
const PLUM = "46, 11, 51"; // --color-ink #2e0b33
const PLUM_SOFT = "138, 92, 143"; // --color-fog #8a5c8f

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function importanceOf(kind: StarMemory["kind"], hasMedia: boolean): Importance {
  if (kind === "milestone") return 2;
  if (hasMedia && (kind === "photo" || kind === "video" || kind === "voice")) return 1;
  if (kind === "conversation") return 1;
  return 0;
}

function familyOf(mood?: Mood | null): Family {
  switch (mood) {
    case "love":
    case "tenderness":
    case "joy":
    case "laughter":
    case "pride":
    case "grateful":
      return "warm";
    case "ache":
    case "yearning":
    case "homesick":
    case "wonder":
      return "cool";
    default:
      return "calm";
  }
}

function luminanceOf(mood?: Mood | null): number {
  switch (mood) {
    case "joy":
    case "laughter":
    case "pride":
    case "grateful":
    case "love":
      return 1.3;
    case "tenderness":
    case "wonder":
    case "peace":
      return 1.08;
    case "ache":
    case "yearning":
    case "homesick":
    case "ordinary":
      return 0.9;
    default:
      return 1.05;
  }
}

interface Star {
  id: string;
  index: number;
  title: string;
  date: string;
  description: string;
  locationName: string | null;
  kind: StarMemory["kind"];
  chapterId: string | null;
  status: MemoryStatus | null;
  x: number;
  y: number;
  r: number;
  imp: Importance;
  family: Family;
  lum: number;
  phase: number;
  hasPhoto: boolean;
  h: number;
}

interface Cluster {
  chapter: Chapter;
  stars: Star[];
  cx: number;
  cy: number;
  radius: number;
}

interface Segment {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
}

interface Layout {
  stars: Star[];
  byId: Map<string, Star>;
  origin: { x: number; y: number };
  path: Segment[];
  clusters: Cluster[];
  starCount: number;
}

function fmtDay(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtStamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
}

function importanti(kind: StarMemory["kind"]): string {
  return kind.replace("-", " ");
}

function buildLayout(memories: StarMemory[], chapters: Chapter[], W: number, H: number): Layout {
  const stars: Star[] = memories
    .filter(
      (m) =>
        typeof m.constellationX === "number" &&
        typeof m.constellationY === "number" &&
        m.constellationX >= 0 &&
        m.constellationX <= 1 &&
        m.constellationY >= 0 &&
        m.constellationY <= 1
    )
    .map((m, i) => {
      const h = hashStr(m.id);
      const hasMedia = !!m.media && m.media.length > 0;
      const imp = importanceOf(m.kind, hasMedia);
      return {
        id: m.id,
        index: i,
        title: m.title,
        date: m.date,
        description: m.description,
        locationName: m.locationName ?? null,
        kind: m.kind,
        chapterId: m.chapterId ?? null,
        status: m.status ?? null,
        x: m.constellationX! * W,
        y: m.constellationY! * H,
        r: (imp === 2 ? 7 : imp === 1 ? 5 : 3.4) * (0.9 + ((h % 100) / 100) * 0.35),
        imp,
        family: familyOf(m.mood),
        lum: luminanceOf(m.mood),
        phase: 0.0006 + ((h % 1000) / 1000) * 0.0024,
        hasPhoto: !!m.media && m.media.some((s) => s.type === "image" || s.thumbnailUrl),
        h,
      };
    })
    .sort((a, b) => {
      const d = new Date(a.date).getTime() - new Date(b.date).getTime();
      return isNaN(d) ? a.index - b.index : d || a.index - b.index;
    });

  const origin = { x: W * ORIGIN_POS.x, y: H * ORIGIN_POS.y };

  const path: Segment[] = [];
  const pts = [{ x: origin.x, y: origin.y }, ...stars];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const sag = Math.min(len * 0.18, 44) * (i % 2 === 0 ? 1 : -1) * 0.7 + 12;
    path.push({
      x1: a.x,
      y1: a.y,
      cx: (a.x + b.x) / 2 + nx * sag,
      cy: (a.y + b.y) / 2 + ny * sag,
      x2: b.x,
      y2: b.y,
    });
  }

  const chapterMap = new Map<string, Chapter>();
  for (const ch of chapters) chapterMap.set(ch.id, ch);

  const grouped = new Map<string, Star[]>();
  for (const s of stars) {
    const cid = s.chapterId;
    if (!cid || !chapterMap.has(cid)) continue;
    const list = grouped.get(cid) ?? [];
    list.push(s);
    grouped.set(cid, list);
  }

  const clusters: Cluster[] = [];
  for (const [cid, list] of grouped) {
    const chapter = chapterMap.get(cid)!;
    let cx = 0;
    let cy = 0;
    for (const s of list) {
      cx += s.x;
      cy += s.y;
    }
    cx /= list.length;
    cy /= list.length;
    let radius = list.length === 1 ? 26 : 34;
    for (const s of list) {
      radius = Math.max(radius, Math.hypot(s.x - cx, s.y - cy) + s.r + 12);
    }
    clusters.push({ chapter, stars: list, cx, cy, radius: Math.min(radius, 96) });
  }
  clusters.sort((a, b) => a.chapter.order - b.chapter.order);

  const byId = new Map<string, Star>();
  for (const s of stars) byId.set(s.id, s);

  return { stars, byId, origin, path, clusters, starCount: stars.length };
}

function buildStaticLayer(layout: Layout, W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const { origin, path, clusters } = layout;
// soft rose wash under everything
  const wash = (x: number, y: number, r: number, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${ROSE},${a})`);
    g.addColorStop(1, `rgba(${ROSE},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  wash(origin.x, origin.y, W * 0.3, 0.08);
  for (const cl of clusters) wash(cl.cx, cl.cy, cl.radius * 2.1, 0.05);

  // chapter constellations — soft glow, its ring, and its code
  for (const cl of clusters) {
    const g = ctx.createRadialGradient(cl.cx, cl.cy, 0, cl.cx, cl.cy, cl.radius * 1.7);
    g.addColorStop(0, `rgba(${ROSE},0.09)`);
    g.addColorStop(1, `rgba(${ROSE},0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cl.cx, cl.cy, cl.radius * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cl.cx, cl.cy, cl.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ROSE_MID},0.34)`;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cl.cx, cl.cy, cl.radius * 1.22, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${GOLD},0.2)`;
    ctx.stroke();

    ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(${PLUM_SOFT},0.9)`;
    ctx.fillText(cl.chapter.code.toUpperCase(), cl.cx, cl.cy + cl.radius + 15);
  }

  // the journey — organic rose threads from the origin through the memories
  if (path.length > 0) {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(${ROSE},0.4)`;
    ctx.beginPath();
    for (const s of path) {
      ctx.moveTo(s.x1, s.y1);
      ctx.quadraticCurveTo(s.cx, s.cy, s.x2, s.y2);
    }
    ctx.stroke();
  }

  return c;
}

function tint(s: Star, a: number): string {
  switch (s.family) {
    case "warm":
      return `rgba(${ROSE},${a})`;
    case "cool":
      return `rgba(${VIOLET},${Math.min(a * 0.9, 0.7)})`;
    default:
      return `rgba(${ROSE_SOFT},${a})`;
  }
}

function drawOrigin(
  ctx: CanvasRenderingContext2D,
  origin: { x: number; y: number },
  now: number,
  reduced: boolean,
  name: string,
  stamp: string,
  caption?: string
) {
  const pulse = reduced ? 0.5 : (Math.sin(now / 1000) + 1) / 2;

  const halo = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, 56);
  halo.addColorStop(0, `rgba(${ROSE},${0.22 + 0.12 * pulse})`);
  halo.addColorStop(1, `rgba(${ROSE},0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 56, 0, Math.PI * 2);
  ctx.fill();

  if (!reduced) {
    const w = (now / 1600) % 1;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 17 + w * 54, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ROSE},${(1 - w) * 0.26})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // shimmering rays
  ctx.strokeStyle = `rgba(${ROSE},${0.55 + 0.25 * pulse})`;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.moveTo(origin.x + Math.cos(a) * 18, origin.y + Math.sin(a) * 18);
    ctx.lineTo(origin.x + Math.cos(a) * 36, origin.y + Math.sin(a) * 36);
  }
  ctx.stroke();
  ctx.strokeStyle = `rgba(${GOLD},${0.6 + 0.2 * pulse})`;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    ctx.moveTo(origin.x + Math.cos(a) * 15, origin.y + Math.sin(a) * 15);
    ctx.lineTo(origin.x + Math.cos(a) * 25, origin.y + Math.sin(a) * 25);
  }
  ctx.stroke();

  // double ring
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 14, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ROSE_MID},0.6)`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 23, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${VIOLET},0.3)`;
  ctx.stroke();

  // diamond + core
  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = `rgba(${ROSE_SOFT},0.95)`;
  ctx.fillRect(-6.5, -6.5, 13, 13);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 4.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${ROSE_WHITE},1)`;
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  if (name) {
    ctx.font = '700 13px "Nunito Sans", system-ui, sans-serif';
    ctx.fillStyle = `rgba(${PLUM},0.95)`;
    ctx.fillText(name, origin.x + 20, origin.y - 17);
  }
  if (stamp) {
    ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = `rgba(${PLUM_SOFT},0.95)`;
    ctx.fillText(stamp.toUpperCase(), origin.x + 20, origin.y - 1);
  }
  if (caption) {
    ctx.font = 'italic 700 11px "Nunito Sans", system-ui, sans-serif';
    ctx.fillStyle = `rgba(${ROSE},0.95)`;
    ctx.fillText(caption, origin.x + 20, origin.y + 17);
  }
}

export function Constellation({
  memories,
  chapters = [],
  originName,
  originDate,
  originCaption,
  className,
  width: W = 900,
  height: H = 460,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const [reduced, setReduced] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pos, setPos] = useState<{ sx: number; sy: number; w: number; h: number } | null>(null);

  const layout = useMemo(() => buildLayout(memories, chapters, W, H), [memories, chapters, W, H]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const selRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const focusRef = useRef<string | null>(null);
  selRef.current = selectedId;
  hoverRef.current = hoverId;
  focusRef.current = focusId;

  const stamp = originDate ? fmtStamp(originDate) : "";
  const starCount = layout.starCount;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const staticLayer = buildStaticLayer(layout, W, H);

    const dust = Array.from({ length: 44 }, (_, i) => ({
      x: ((hashStr(`dust-${i}`) % 1000) / 1000) * W,
      y: ((hashStr(`dusty-${i}`) % 1000) / 1000) * H,
      phase: ((hashStr(`d-${i}`) % 1000) / 1000) * Math.PI * 2,
      sp: 0.7 + ((i % 5) / 5) * 1.6,
      s: 0.5 + ((i % 3) / 3) * 0.6,
    }));

    const shooting = { active: false, t: 0, x: 0, y: 0, vx: 0, vy: 0, u: 0.5 };

    function drawStar(ctx: CanvasRenderingContext2D, s: Star, now: number, noted: boolean) {
      const tw = reduced ? 1 : 0.82 + 0.18 * Math.sin((now / 520) * s.phase + s.h % 7);
      const amp = s.lum * tw * (noted ? 1.15 : 1);
      const R = s.r;
      const xx = s.x;
      const yy = s.y;

      // big outer halo — the light spill of a shining star
      const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, R * 7);
      g.addColorStop(0, tint(s, 0.34 * amp));
      g.addColorStop(1, `rgba(${ROSE},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(xx, yy, R * 7, 0, Math.PI * 2);
      ctx.fill();

      // tapered sparkle rays — a real 4-point star
      const rayLen = R * (5.2 + 2.4 * tw);
      ctx.save();
      ctx.translate(xx, yy);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        const rg = ctx.createLinearGradient(0, 0, 0, -rayLen);
        rg.addColorStop(0, `rgba(255,255,255,${0.95 * amp})`);
        rg.addColorStop(0.45, tint(s, 0.55 * amp));
        rg.addColorStop(1, `rgba(${ROSE},0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.moveTo(-R * 0.7, R * 0.25);
        ctx.quadraticCurveTo(-R * 0.28, -R * 0.7, 0, -rayLen);
        ctx.quadraticCurveTo(R * 0.28, -R * 0.7, R * 0.7, R * 0.25);
        ctx.closePath();
        ctx.fill();
      }
      // diagonal gold glints (true twinkle)
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const gl = R * (1.5 + 1.1 * tw);
        ctx.strokeStyle = `rgba(${GOLD},${0.7 * amp})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 1.1, Math.sin(a) * R * 1.1);
        ctx.lineTo(Math.cos(a) * gl, Math.sin(a) * gl);
        ctx.stroke();
      }
      ctx.restore();

      if (s.imp === 2) {
        ctx.beginPath();
        ctx.arc(xx, yy, R * 2.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ROSE_MID},${0.4 * amp})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xx, yy, R * 3.1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GOLD},${0.3 * amp})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      if (s.hasPhoto && s.imp >= 1) {
        ctx.beginPath();
        ctx.arc(xx, yy, R * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ROSE_SOFT},0.4)`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      if (s.status && s.status !== "verified") {
        ctx.beginPath();
        ctx.arc(xx, yy, R * 2.2, 0, Math.PI * 2);
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = `rgba(${VIOLET},0.55)`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // diamond core — white-hot center with a colored body
      ctx.save();
      ctx.translate(xx, yy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = `rgba(${ROSE_SOFT},${0.9 * amp})`;
      ctx.fillRect(-R * 0.75, -R * 0.75, R * 1.5, R * 1.5);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(xx, yy, R * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ROSE_WHITE},1)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(xx, yy, R * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      if (noted) {
        ctx.beginPath();
        ctx.arc(xx, yy, R + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${PLUM},0.75)`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    }

    function render(now: number) {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(staticLayer, 0, 0, W, H);

      const layNow = layoutRef.current;
      drawOrigin(ctx, layNow.origin, now, reduced, originName || "", stamp, originCaption);

      const note = new Set<string>();
      if (hoverRef.current) note.add(hoverRef.current);
      if (focusRef.current) note.add(focusRef.current);
      if (selRef.current) note.add(selRef.current);

      for (const s of layNow.stars) drawStar(ctx, s, now, note.has(s.id));

      if (!reduced) {
        // distant particles slowly crossing
        for (const d of dust) {
          const x = d.x + Math.sin(now / 5200 + d.phase) * 7;
          const y = d.y + Math.cos(now / 3000 + d.phase * 1.7) * 5;
          const a = (0.16 + 0.12 * Math.sin(now / 1400 + d.phase)) * d.s;
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ROSE_MID},${Math.max(a, 0.06)})`;
          ctx.fill();
        }

        // occasional shooting star
        if (shooting.active) {
          const t = now - shooting.t;
          if (t > 900) {
            shooting.active = false;
          } else {
            const px = shooting.x + shooting.vx * t;
            const py = shooting.y + shooting.vy * t;
            const tail = shooting.u * 0.2 + 60;
            const fade = 1 - t / 900;
            const g = ctx.createLinearGradient(px, py, px - shooting.vx * tail, py - shooting.vy * tail);
            g.addColorStop(0, `rgba(${GOLD},${fade})`);
            g.addColorStop(0.5, `rgba(${ROSE_SOFT},${0.5 * fade})`);
            g.addColorStop(1, `rgba(${ROSE},0)`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - shooting.vx * tail, py - shooting.vy * tail);
            ctx.stroke();
          }
        } else if (Math.random() < 0.0013) {
          shooting.active = true;
          shooting.t = now;
          const ang = -0.28 - Math.random() * 0.5;
          shooting.vx = Math.cos(ang) * (0.24 + Math.random() * 0.12);
          shooting.vy = Math.sin(ang) * (0.24 + Math.random() * 0.12);
          shooting.x = W * (0.2 + Math.random() * 0.6);
          shooting.y = H * (0.05 + Math.random() * 0.3);
          shooting.u = Math.random();
        }
      }
    }

    if (reduced) {
      render(0);
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      render(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layout, reduced, W, H, stamp, originName, originCaption]);

  useLayoutEffect(() => {
    function update() {
      const id = selectedId ?? hoverId;
      const rect = wrapRef.current?.getBoundingClientRect();
      const s = id ? layoutRef.current.byId.get(id) : undefined;
      if (!id || !rect || !s) {
        setPos(null);
        return;
      }
      setPos({ sx: (s.x / W) * rect.width, sy: (s.y / H) * rect.height, w: rect.width, h: rect.height });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [selectedId, hoverId, W, H]);

  function hitTest(mx: number, my: number, pad: number): string | null {
    let best: { id: string; d: number } | null = null;
    for (const s of layoutRef.current.stars) {
      const d = Math.hypot(s.x - mx, s.y - my) - s.r;
      if (d <= pad && (!best || d < best.d)) best = { id: s.id, d };
    }
    return best?.id ?? null;
  }

  function toLocal(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { mx: 0, my: 0 };
    return { mx: (e.clientX - rect.left) * (W / rect.width), my: (e.clientY - rect.top) * (H / rect.height) };
  }

  function handlePointerMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const pointer = (e.nativeEvent as PointerEvent).pointerType;
    if (pointer && pointer !== "mouse") return;
    const { mx, my } = toLocal(e);
    setHoverId(hitTest(mx, my, 9));
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const pointer = (e.nativeEvent as PointerEvent).pointerType;
    const pad = pointer === "touch" ? 16 : 9;
    const { mx, my } = toLocal(e);
    const id = hitTest(mx, my, pad);
    if (!id) {
      setSelectedId(null);
      setHoverId(null);
      return;
    }
    if (selectedId === id) {
      router.push(`/memories/${id}`);
      return;
    }
    setSelectedId(id);
    setHoverId(id);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const stars = layout.stars;
    if (stars.length === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = stars.findIndex((s) => s.id === focusId);
      let next = idx === -1 ? 0 : idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (next + 1) % stars.length;
      else next = (next - 1 + stars.length) % stars.length;
      const s = stars[next];
      setFocusId(s.id);
      setSelectedId(s.id);
      setHoverId(null);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = focusId ?? stars[0]?.id;
      if (id) router.push(`/memories/${id}`);
    } else if (e.key === "Escape") {
      setSelectedId(null);
      setFocusId(null);
    }
  }

  const target = selectedId ?? hoverId;
  const targetStar = target ? layout.byId.get(target) ?? null : null;
  const flipX = pos ? pos.sx > pos.w * 0.58 : false;
  const flipY = pos ? pos.sy > pos.h * 0.6 : false;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={`The Biggylinho universe — ${starCount} memory ${starCount === 1 ? "star" : "stars"} connected by our journey, beginning ${
          stamp ? `on ${stamp}` : "with the day we became us"
        }. Use arrow keys to move between stars and Enter to open one.`}
        className={cn("block w-full outline-none", target && "cursor-pointer")}
        style={{ aspectRatio: `${W}/${H}` }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverId(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setFocusId(null);
        }}
      />

      {starCount === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center pr-0 text-center" style={{ paddingTop: "22%" }}>
          <span className="rounded-full border border-[#e44297]/35 bg-white/85 px-4 py-1.5 font-display text-sm italic text-[#2e0b33] backdrop-blur-sm">
            Every universe starts with one star.
          </span>
        </p>
      ) : null}

      {targetStar && pos ? (
        <div
          role="dialog"
          aria-label={`Memory preview: ${targetStar.title}`}
          className="absolute z-10 w-[min(17rem,calc(100%-16px))] rounded-xl border border-[#e44297]/35 bg-[#fff8fe]/95 p-3 shadow-[0_20px_44px_-14px_rgba(46,11,51,0.35)] backdrop-blur-md"
          style={{
            left: pos.sx + (flipX ? -12 : 12),
            top: pos.sy + (flipY ? -12 : 12),
            transform: `translate(${flipX ? "-100%" : 0}, ${flipY ? "-100%" : 0})`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-mono text-[9px] uppercase tracking-[0.15em] text-champagne/90">
              {importanti(targetStar.kind)}
              {targetStar.status && targetStar.status !== "verified" ? " · in progress" : ""}
            </span>
            {selectedId === targetStar.id ? (
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close preview"
                className="shrink-0 rounded-full px-1 text-[11px] leading-none text-[#8a5c8f] transition-colors hover:text-[#2e0b33]"
              >
                ✕
              </button>
            ) : null}
          </div>
          <p className="mt-1 font-display text-sm leading-snug text-[#2e0b33]">{targetStar.title}</p>
          <p className="mt-1 font-mono text-[10px] text-[#8a5c8f]">
            {fmtDay(targetStar.date)}
            {targetStar.locationName ? <span className="text-[#a24a7f]"> · {targetStar.locationName}</span> : null}
          </p>
          {selectedId === targetStar.id ? (
            <>
              {targetStar.description ? (
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-[#6b4a72]">{targetStar.description}</p>
              ) : null}
              <Link
                href={`/memories/${targetStar.id}`}
                className="mt-3 inline-flex h-8 items-center rounded-full bg-[#5a0b62] px-4 text-[11px] font-medium text-white transition-colors hover:bg-[#6d1a76]"
              >
                Open memory →
              </Link>
            </>
          ) : (
            <p className="mt-1.5 text-[10px] text-[#8a5c8f]">Tap or click to open the full memory</p>
          )}
        </div>
      ) : null}
    </div>
  );
}