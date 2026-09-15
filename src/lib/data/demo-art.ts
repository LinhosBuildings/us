const PALETTES = [
  ["#1c1c28", "#2a2636", "#3c3240"],
  ["#161a24", "#243044", "#2c2a3e"],
  ["#1d1f2a", "#35304a", "#4a3a3f"],
  ["#14161f", "#1f2937", "#374151"],
  ["#201a24", "#3a2c38", "#503a34"],
  ["#101a1f", "#1f3234", "#284038"],
  ["#1b1e2a", "#2c2f42", "#3a3448"],
  ["#181418", "#2e232c", "#433031"],
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2147483647;
}

function pick<T>(str: string, arr: T[]): T {
  return arr[hash(str) % arr.length];
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates an elegant, deterministic "memory photograph" as an SVG data URL.
 * Works fully offline so the demo never depends on the network.
 */
export function svgPhoto(opts: { seed: string; title?: string; date?: string; mood?: string; label?: string }) {
  const { seed, title, date, mood, label } = opts;
  const palette = pick(seed, PALETTES);
  const [c1, c2, c3] = palette;
  const accent = pick(seed, ["#c9a961", "#c97d5f", "#7d8f7b", "#8f9bb3", "#a3947a", "#b08d57"]);
  const initial = (label ?? "M").slice(0, 1).toUpperCase();
  const titleLine = title ? esc(title.slice(0, 42)) : "Untitled";
  const dateLine = date ? esc(date) : "";
  const moodLine = mood ? esc(mood) : "";
  const circles = [...Array(5)].map((_, i) => {
    const x = (hash(seed + "x" + i) % 88) + 6;
    const y = (hash(seed + "y" + i) % 80) + 10;
    const r = (hash(seed + "r" + i) % 14) + 6;
    return `<circle cx="${x}%" cy="${y}%" r="${r}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="1"/>`;
  }).join("");
  const rings = [...Array(3)].map((_, i) => {
    const r = 40 + i * 26;
    const o = 0.06 - i * 0.015;
    return `<circle cx="72%" cy="26%" r="${r}" fill="none" stroke="#ecebe3" stroke-opacity="${o}" stroke-width="${1 + i * 0.5}"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.55" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.26" r="0.6">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <rect width="1200" height="900" fill="url(#glow)"/>
  ${rings}
  ${circles}
  <g opacity="0.05" filter="url(#grain)"><rect width="1200" height="900" fill="#ffffff"/></g>
  <text x="90" y="470" font-family="Georgia, 'Times New Roman', serif" font-size="360" font-style="italic" fill="#ecebe3" fill-opacity="0.9">${esc(initial)}</text>
  <text x="90" y="700" font-family="Georgia, 'Times New Roman', serif" font-size="54" fill="#ecebe3">${titleLine}</text>
  <text x="90" y="752" font-family="'Courier New', monospace" font-size="22" letter-spacing="4" fill="${accent}">${dateLine}</text>
  <text x="90" y="792" font-family="'Courier New', monospace" font-size="20" letter-spacing="6" fill="#ecebe3" fill-opacity="0.4">${moodLine}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgVideo(opts: { seed: string; title?: string; date?: string }) {
  const photo = svgPhoto(opts);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#0b0b10"/>
  <circle cx="600" cy="430" r="72" fill="#c9a961" fill-opacity="0.12" stroke="#c9a961" stroke-width="1.5"/>
  <circle cx="600" cy="430" r="72" fill="none" stroke="#ecebe3" stroke-opacity="0.28" stroke-width="1"/>
  <path d="M588 398 L600 398 L600 462 L588 462 Q570 430 588 398 Z" fill="#ecebe3"/>
  <text x="600" y="560" text-anchor="middle" font-family="'Courier New', monospace" font-size="20" letter-spacing="5" fill="#98959f">${esc(opts.title ?? "A MOVING MOMENT")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgWaveform(opts: { seed: string; label?: string; durationMs?: number }) {
  const accent = pick(opts.seed, ["#c9a961", "#c97d5f", "#7d8f7b", "#8f9bb3"]);
  const bars = [...Array(48)].map((_, i) => {
    const h = (hash(opts.seed + "b" + i * 7) % 60) + 14;
    const gap = Math.sin(i * 1.7) * 8;
    const y = 80 - (h / 2 + gap);
    return `<rect x="${i * 14 + 8}" y="${y}" width="6" height="${Math.max(8, h + gap)}" rx="3" fill="${accent}" opacity="${0.5 + (hash(opts.seed + "o" + i) % 30) / 100}"/>`;
  }).join("");
  const rel = Math.round((opts.durationMs ?? 45000) / 1000);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="160" viewBox="0 0 720 160">
  <rect width="720" height="160" fill="#0b0b10" rx="18"/>
  <circle cx="42" cy="42" r="18" fill="${accent}" fill-opacity="0.9"/>
  <path d="M36 34 L36 50 M46 30 L46 54" stroke="#0b0b10" stroke-width="2.5" stroke-linecap="round"/>
  ${bars}
  <text x="34" y="132" font-family="'Courier New', monospace" font-size="16" letter-spacing="3" fill="#98959f">${rel} SEC</text>
  <text x="360" y="132" text-anchor="middle" font-family="'Courier New', monospace" font-size="14" letter-spacing="4" fill="#ecebe3" fill-opacity="0.5">${esc(opts.label ?? "A VOICE NOTE")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgAvatar(opts: { seed: string; name: string }) {
  const palette = pick(opts.seed, PALETTES);
  const [a, b] = palette;
  const initials = opts.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="256" height="256" fill="url(#g)"/>
  <circle cx="128" cy="100" r="46" fill="#ecebe3" fill-opacity="0.12"/>
  <path d="M52 236 Q80 150 128 150 Q176 150 204 236 Z" fill="#ecebe3" fill-opacity="0.12"/>
  <text x="128" y="146" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#ecebe3">${esc(initials)}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}