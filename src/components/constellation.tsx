"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Memory } from "@/lib/types";

interface Props {
  memories: Pick<Memory, "id" | "title" | "date" | "constellationX" | "constellationY" | "mood" | "kind">[];
  onClickMemory?: (id: string) => void;
  className?: string;
  width?: number;
  height?: number;
}

function constellationColor(mood?: Memory["mood"] | null): string {
  switch (mood) {
    case "love":
    case "tenderness":
      return "#c9a961";
    case "joy":
    case "laughter":
    case "grateful":
    case "pride":
      return "#ddc693";
    case "peace":
      return "#a4c3b2";
    case "wonder":
    case "yearning":
    case "homesick":
      return "#8b9ebf";
    case "ache":
      return "#8a718a";
    case "ordinary":
      return "#98959f";
    default:
      return "#98959f";
  }
}

function constellationRadius(kind: Memory["kind"]): number {
  switch (kind) {
    case "milestone":
      return 8;
    case "photo":
    case "video":
      return 5;
    case "voice":
    case "conversation":
      return 4.5;
    case "little-thing":
      return 3.5;
    default:
      return 4;
  }
}

interface Star {
  id: string;
  title: string;
  x: number;
  y: number;
  color: string;
  r: number;
  date: string;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

export function Constellation({ memories, onClickMemory, className, width: W = 900, height: H = 600 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Star | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const starsRef = useRef<Star[]>([]);
  const linesRef = useRef<Line[]>([]);

  useEffect(() => {
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
      .map((m) => ({
        id: m.id,
        title: m.title,
        x: m.constellationX! * W,
        y: m.constellationY! * H,
        color: constellationColor(m.mood),
        r: constellationRadius(m.kind),
        date: m.date,
      }));

    const lines: Line[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) {
          lines.push({
            x1: stars[i].x,
            y1: stars[i].y,
            x2: stars[j].x,
            y2: stars[j].y,
            opacity: 1 - d / 160,
          });
        }
      }
    }

    starsRef.current = stars;
    linesRef.current = lines;
  }, [memories, W, H]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let anim: number;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // draw lines
      for (const line of linesRef.current) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = `rgba(201,169,97,${line.opacity * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // draw stars
      for (const star of starsRef.current) {
        // glow
        const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
        grad.addColorStop(0, star.color);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      }

      // draw hover tooltip
      if (hover && mousePos) {
        ctx.fillStyle = "rgba(11,11,16,0.92)";
        const textW = ctx.measureText(hover.title).width;
        const tw = textW + 20;
        const th = 28;
        const rx = Math.min(mousePos.x + 12, W - tw - 4);
        const ry = Math.max(mousePos.y - 36, 4);
        ctx.beginPath();
        ctx.roundRect(rx, ry, tw, th, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(201,169,97,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#ecebe3";
        ctx.font = '13px "Inter", sans-serif';
        ctx.textBaseline = "middle";
        ctx.fillText(hover.title, rx + 10, ry + th / 2);
      }

      anim = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(anim);
  }, [hover, mousePos, W, H]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    setMousePos({ x: mx, y: my });

    let found: Star | null = null;
    for (const s of starsRef.current) {
      const d = Math.sqrt((s.x - mx) ** 2 + (s.y - my) ** 2);
      if (d < 20) {
        found = s;
        break;
      }
    }
    setHover(found);
  }

  function handleClick() {
    if (hover && onClickMemory) onClickMemory(hover.id);
  }

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={cn("w-full rounded-2xl bg-midnight/60 border border-line", hover && "cursor-pointer", className)}
      style={{ aspectRatio: `${W}/${H}` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setHover(null);
        setMousePos(null);
      }}
      onClick={handleClick}
    />
  );
}