import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import logoAsset from "@/lib/logo";

const meta = (t: string, d: string) => ({
  meta: [
    { title: t },
    { name: "description", content: d },
    { property: "og:title", content: t },
    { property: "og:description", content: d },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ],
});

/* ---------------- থিম ও সাইজ ---------------- */

type ThemeId =
  | "signature"
  | "breaking"
  | "editorial"
  | "midnight"
  | "gradient"
  | "frame"
  | "split"
  | "quote";

type Theme = {
  id: ThemeId;
  name: string;
  hint: string;
  accent: string;
  ink: string;
  premium: boolean;
};

const THEMES: Theme[] = [
  {
    id: "signature",
    name: "সিগনেচার (ডিফল্ট)",
    hint: "লোগোর রঙে প্রিমিয়াম লাল-কালো প্যানেল, সোনালি রেখা",
    accent: "#ED1C24",
    ink: "#0B0B0C",
    premium: true,
  },
  {
    id: "breaking",
    name: "ব্রেকিং নিউজ",
    hint: "উপরে ব্রেকিং ব্যাজ, নিচে গাঢ় লাল ব্লক",
    accent: "#ED1C24",
    ink: "#111111",
    premium: true,
  },
  {
    id: "editorial",
    name: "এডিটোরিয়াল হোয়াইট",
    hint: "সাদা কার্ড, লাল কিকার, কালো শিরোনাম",
    accent: "#ED1C24",
    ink: "#101114",
    premium: true,
  },
  {
    id: "midnight",
    name: "মিডনাইট গ্লাস",
    hint: "গাঢ় ব্যাকগ্রাউন্ডে কাঁচের মতো কার্ড",
    accent: "#ED1C24",
    ink: "#07070A",
    premium: true,
  },
  {
    id: "gradient",
    name: "সিনেমাটিক গ্রেডিয়েন্ট",
    hint: "ফুল ছবি, নিচে গভীর শেড",
    accent: "#ED1C24",
    ink: "#000000",
    premium: false,
  },
  {
    id: "frame",
    name: "মিনিমাল ফ্রেম",
    hint: "পাতলা বর্ডার, পরিচ্ছন্ন টাইপোগ্রাফি",
    accent: "#ED1C24",
    ink: "#141414",
    premium: false,
  },
  {
    id: "split",
    name: "স্প্লিট ম্যাগাজিন",
    hint: "উপরে ছবি, নিচে ম্যাগাজিন স্টাইল লেখা",
    accent: "#ED1C24",
    ink: "#0E0E10",
    premium: true,
  },
  {
    id: "quote",
    name: "উক্তি কার্ড",
    hint: "বড় উদ্ধৃতি চিহ্নসহ বক্তব্য কার্ড",
    accent: "#ED1C24",
    ink: "#0B0B0C",
    premium: true,
  },
];

const SIZES = [
  { id: "square", name: "স্কয়ার ১০৮০×১০৮০", w: 1080, h: 1080 },
  { id: "portrait", name: "পোর্ট্রেট ১০৮০×১৩৫০", w: 1080, h: 1350 },
  { id: "story", name: "স্টোরি ১০৮০×১৯২০", w: 1080, h: 1920 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

/* ---------------- ক্যানভাস হেল্পার ---------------- */

function fontOf(size: number, weight = "700") {
  return `${weight} ${size}px "SolaimanLipi", "Noto Sans Bengali", "Hind Siliguri", system-ui, sans-serif`;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    trimmed[maxLines - 1] = `${trimmed[maxLines - 1]}…`;
    return trimmed;
  }
  return lines;
}

function drawParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  let cursor = y;
  for (const line of wrapLines(ctx, text, maxWidth, maxLines)) {
    ctx.fillText(line, x, cursor);
    cursor += lineHeight;
  }
  return cursor;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** zoom ও ভার্টিক্যাল ফোকাস মেনে ছবি cover করে আঁকে। */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1,
  focusY = 50,
) {
  const ratio = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) * (focusY / 100);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function shade(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number) {
  if (a <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.fillRect(x, y, w, h);
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full || "000000", 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/* ---------------- রুট ---------------- */

export const Route = createFileRoute("/admin/photocard")({
  head: () =>
    meta(
      "ফটোকার্ড জেনারেটর — প্রভাতবাংলা অ্যাডমিন",
      "প্রিমিয়াম থিমে নিউজ ফটোকার্ড তৈরি করুন — ছবি, শিরোনাম, ক্যাটাগরি ও রঙ নিজের মতো সাজিয়ে ডাউনলোড করুন।",
    ),
  component: PhotocardGenerator,
});

function PhotocardGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [themeId, setThemeId] = useState<ThemeId>("signature");
  const [sizeId, setSizeId] = useState<SizeId>("square");

  const [kicker, setKicker] = useState("জাতীয়");
  const [showKicker, setShowKicker] = useState(true);
  const [title, setTitle] = useState("সন্ধ্যার সংবাদ");
  const [subtitle, setSubtitle] = useState("আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।");
  const [credit, setCredit] = useState("");
  const [dateText, setDateText] = useState(
    new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
  );
  const [domain, setDomain] = useState("www.provatbanglanews.com");
  const [facebook, setFacebook] = useState("provatbangla");

  const [accent, setAccent] = useState("#ED1C24");
  const [ink, setInk] = useState("#0B0B0C");
  const [titleScale, setTitleScale] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [focusY, setFocusY] = useState(50);
  const [darkness, setDarkness] = useState(35);
  const [showLogo, setShowLogo] = useState(true);
  const [showGrain, setShowGrain] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0];
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  /** থিম বদলালে সেই থিমের নিজস্ব রঙ বসে। */
  const applyTheme = (id: ThemeId) => {
    const next = THEMES.find((t) => t.id === id);
    setThemeId(id);
    if (next) {
      setAccent(next.accent);
      setInk(next.ink);
    }
  };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = size.w;
    const H = size.h;
    canvas.width = W;
    canvas.height = H;

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
      });

    const photo = imgSrc ? await loadImg(imgSrc) : null;
    const logo = showLogo ? await loadImg(logoAsset.url) : null;

    const z = zoom / 100;
    const dark = darkness / 100;
    const ts = titleScale / 100;
    const M = Math.round(W * 0.065); // সাধারণ মার্জিন

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";

    const placeholder = (x: number, y: number, w: number, h: number) => {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "#e9ebee");
      g.addColorStop(1, "#cfd3d8");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#9aa0a6";
      ctx.font = fontOf(Math.round(w * 0.07));
      ctx.textAlign = "center";
      ctx.fillText("ছবি যোগ করুন", x + w / 2, y + h / 2);
      ctx.textAlign = "left";
    };

    const photoInto = (x: number, y: number, w: number, h: number, radius = 0) => {
      ctx.save();
      roundRect(ctx, x, y, w, h, radius);
      ctx.clip();
      if (photo) drawCover(ctx, photo, x, y, w, h, z, focusY);
      else placeholder(x, y, w, h);
      shade(ctx, x, y, w, h, dark * 0.5);
      ctx.restore();
    };

    const kickerPill = (x: number, y: number, height = Math.round(W * 0.048)) => {
      if (!showKicker || !kicker.trim()) return 0;
      ctx.font = fontOf(Math.round(height * 0.56), "700");
      const textW = ctx.measureText(kicker).width;
      const padX = Math.round(height * 0.45);
      ctx.fillStyle = accent;
      roundRect(ctx, x, y, textW + padX * 2, height, height / 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(kicker, x + padX, y + height * 0.7);
      return height;
    };

    const footer = (x: number, y: number, w: number, color: string) => {
      ctx.font = fontOf(Math.round(W * 0.026), "600");
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(domain, x, y);
      ctx.textAlign = "right";
      ctx.fillText(facebook ? `f/${facebook}` : dateText, x + w, y);
      ctx.textAlign = "left";
    };

    /* ---- থিম অনুযায়ী আঁকা ---- */

    if (themeId === "signature") {
      ctx.fillStyle = ink;
      ctx.fillRect(0, 0, W, H);
      // উপরে সূক্ষ্ম লাল আভা
      const glow = ctx.createLinearGradient(0, 0, W, 0);
      glow.addColorStop(0, hexToRgba(accent, 0.85));
      glow.addColorStop(1, hexToRgba(accent, 0.15));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, Math.round(H * 0.012));

      const pad = Math.round(W * 0.05);
      const imgH = Math.round(H * 0.55);
      photoInto(pad, pad + Math.round(H * 0.055), W - pad * 2, imgH, 20);

      let y = pad + Math.round(H * 0.055) + imgH + Math.round(H * 0.06);
      const used = kickerPill(pad, y - Math.round(W * 0.045));
      if (used) y += Math.round(H * 0.012);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.062 * ts));
      y = drawParagraph(ctx, title, pad, y, W - pad * 2, Math.round(W * 0.075 * ts), 3);

      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.03), "400");
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        y = drawParagraph(ctx, subtitle, pad, y + 10, W - pad * 2, Math.round(W * 0.042), 2);
      }

      // সোনালি হেয়ারলাইন
      const gold = ctx.createLinearGradient(pad, 0, W - pad, 0);
      gold.addColorStop(0, "#E7C873");
      gold.addColorStop(1, hexToRgba(accent, 0.25));
      ctx.fillStyle = gold;
      ctx.fillRect(pad, H - Math.round(H * 0.085), W - pad * 2, 3);
      footer(pad, H - Math.round(H * 0.042), W - pad * 2, "rgba(255,255,255,0.85)");
    }

    if (themeId === "breaking") {
      photoInto(0, 0, W, H, 0);
      const grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, hexToRgba(ink, 0.96));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const bandH = Math.round(W * 0.09);
      ctx.fillStyle = accent;
      ctx.fillRect(0, Math.round(H * 0.08), W, bandH);
      ctx.fillStyle = "#ffffff";
      ctx.font = fontOf(Math.round(bandH * 0.5), "800");
      ctx.textAlign = "left";
      ctx.fillText("ব্রেকিং নিউজ", M, Math.round(H * 0.08) + bandH * 0.68);
      if (showKicker && kicker.trim()) {
        ctx.textAlign = "right";
        ctx.font = fontOf(Math.round(bandH * 0.4), "700");
        ctx.fillText(kicker, W - M, Math.round(H * 0.08) + bandH * 0.66);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = fontOf(Math.round(W * 0.068 * ts), "800");
      let y = H - Math.round(H * 0.26);
      y = drawParagraph(ctx, title, M, y, W - M * 2, Math.round(W * 0.082 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.029), "400");
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        drawParagraph(ctx, subtitle, M, y + 8, W - M * 2, Math.round(W * 0.04), 2);
      }
      footer(M, H - Math.round(H * 0.04), W - M * 2, "rgba(255,255,255,0.9)");
    }

    if (themeId === "editorial") {
      ctx.fillStyle = "#F4F5F7";
      ctx.fillRect(0, 0, W, H);
      const pad = Math.round(W * 0.045);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 26);
      ctx.fill();
      ctx.restore();

      const inner = Math.round(W * 0.085);
      const imgTop = Math.round(H * 0.2);
      const imgH = Math.round(H * 0.42);
      photoInto(inner, imgTop, W - inner * 2, imgH, 16);

      kickerPill(inner, Math.round(H * 0.115));

      let y = imgTop + imgH + Math.round(H * 0.065);
      ctx.fillStyle = ink;
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.058 * ts), "800");
      y = drawParagraph(ctx, title, inner, y, W - inner * 2, Math.round(W * 0.072 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.028), "400");
        ctx.fillStyle = "rgba(0,0,0,0.62)";
        y = drawParagraph(ctx, subtitle, inner, y + 8, W - inner * 2, Math.round(W * 0.04), 2);
      }
      ctx.fillStyle = accent;
      ctx.fillRect(inner, H - Math.round(H * 0.088), Math.round(W * 0.12), 5);
      footer(inner, H - Math.round(H * 0.05), W - inner * 2, "rgba(0,0,0,0.6)");
    }

    if (themeId === "midnight") {
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0B0F1A");
      bg.addColorStop(1, ink);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const pad = Math.round(W * 0.055);
      photoInto(pad, pad, W - pad * 2, Math.round(H * 0.48), 24);

      const cardY = Math.round(H * 0.5) + pad;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      roundRect(ctx, pad, cardY, W - pad * 2, H - cardY - pad, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const inner = pad + Math.round(W * 0.045);
      kickerPill(inner, cardY + Math.round(H * 0.035));

      let y = cardY + Math.round(H * 0.115);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.056 * ts), "700");
      y = drawParagraph(ctx, title, inner, y, W - inner * 2, Math.round(W * 0.07 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.028), "400");
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        drawParagraph(ctx, subtitle, inner, y + 8, W - inner * 2, Math.round(W * 0.04), 2);
      }
      footer(inner, H - pad - Math.round(H * 0.025), W - inner * 2, "rgba(255,255,255,0.8)");
    }

    if (themeId === "gradient") {
      photoInto(0, 0, W, H, 0);
      const grad = ctx.createLinearGradient(0, H * 0.32, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.94)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      kickerPill(M, H - Math.round(H * 0.33));
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.06 * ts));
      let y = H - Math.round(H * 0.24);
      y = drawParagraph(ctx, title, M, y, W - M * 2, Math.round(W * 0.074 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.028), "400");
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        drawParagraph(ctx, subtitle, M, y + 8, W - M * 2, Math.round(W * 0.04), 2);
      }
      footer(M, H - Math.round(H * 0.04), W - M * 2, "rgba(255,255,255,0.85)");
    }

    if (themeId === "frame") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const pad = Math.round(W * 0.04);
      ctx.strokeStyle = hexToRgba(accent, 0.9);
      ctx.lineWidth = 6;
      ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

      const inner = pad + Math.round(W * 0.04);
      photoInto(inner, inner, W - inner * 2, Math.round(H * 0.46), 8);

      let y = inner + Math.round(H * 0.46) + Math.round(H * 0.07);
      kickerPill(inner, y - Math.round(W * 0.055));
      ctx.fillStyle = ink;
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.055 * ts));
      y = drawParagraph(ctx, title, inner, y, W - inner * 2, Math.round(W * 0.07 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.027), "400");
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        drawParagraph(ctx, subtitle, inner, y + 8, W - inner * 2, Math.round(W * 0.038), 2);
      }
      footer(inner, H - inner + Math.round(H * 0.015), W - inner * 2, hexToRgba(accent, 1));
    }

    if (themeId === "split") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      photoInto(0, 0, W, Math.round(H * 0.58), 0);
      ctx.fillStyle = ink;
      ctx.fillRect(0, Math.round(H * 0.58), W, H - Math.round(H * 0.58));
      ctx.fillStyle = accent;
      ctx.fillRect(0, Math.round(H * 0.58), W, 10);

      let y = Math.round(H * 0.58) + Math.round(H * 0.085);
      kickerPill(M, y - Math.round(W * 0.055));
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = fontOf(Math.round(W * 0.058 * ts), "800");
      y = drawParagraph(ctx, title, M, y, W - M * 2, Math.round(W * 0.072 * ts), 3);
      if (subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.028), "400");
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        drawParagraph(ctx, subtitle, M, y + 8, W - M * 2, Math.round(W * 0.04), 2);
      }
      footer(M, H - Math.round(H * 0.038), W - M * 2, "rgba(255,255,255,0.85)");
    }

    if (themeId === "quote") {
      photoInto(0, 0, W, H, 0);
      ctx.fillStyle = hexToRgba(ink, 0.72);
      ctx.fillRect(0, 0, W, H);

      const pad = Math.round(W * 0.08);
      ctx.fillStyle = hexToRgba(accent, 0.95);
      ctx.font = fontOf(Math.round(W * 0.22), "800");
      ctx.textAlign = "left";
      ctx.fillText("\u201C", pad, Math.round(H * 0.3));

      ctx.fillStyle = "#ffffff";
      ctx.font = fontOf(Math.round(W * 0.058 * ts), "700");
      let y = Math.round(H * 0.42);
      y = drawParagraph(ctx, title, pad, y, W - pad * 2, Math.round(W * 0.078 * ts), 5);

      ctx.fillStyle = accent;
      ctx.fillRect(pad, y + 12, Math.round(W * 0.1), 5);
      if (credit.trim() || subtitle.trim()) {
        ctx.font = fontOf(Math.round(W * 0.03), "600");
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(credit.trim() || subtitle, pad, y + Math.round(H * 0.06));
      }
      footer(pad, H - Math.round(H * 0.05), W - pad * 2, "rgba(255,255,255,0.8)");
    }

    /* ---- ক্রেডিট (কোট থিম ছাড়া) ---- */
    if (credit.trim() && themeId !== "quote") {
      ctx.font = fontOf(Math.round(W * 0.022), "500");
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "right";
      ctx.fillText(`ছবি: ${credit}`, W - M, Math.round(H * 0.075));
      ctx.textAlign = "left";
    }

    /* ---- তারিখ ---- */
    if (dateText.trim()) {
      ctx.font = fontOf(Math.round(W * 0.024), "600");
      const onLight = themeId === "editorial" || themeId === "frame";
      ctx.fillStyle = onLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
      ctx.textAlign = "right";
      ctx.fillText(dateText, W - M, Math.round(H * 0.045));
      ctx.textAlign = "left";
    }

    /* ---- লোগো ---- */
    if (logo) {
      const lw = Math.round(W * 0.2);
      const lh = (logo.height / logo.width) * lw;
      const lx = M;
      const ly = Math.round(H * 0.028);
      const onLight = themeId === "editorial" || themeId === "frame";
      if (!onLight) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        roundRect(ctx, lx - 12, ly - 8, lw + 24, lh + 16, 12);
        ctx.fill();
      }
      ctx.drawImage(logo, lx, ly, lw, lh);
    }

    /* ---- সূক্ষ্ম গ্রেইন টেক্সচার ---- */
    if (showGrain) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 2600; i += 1) {
        ctx.fillStyle = i % 2 ? "#ffffff" : "#000000";
        ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }
      ctx.restore();
    }
  }, [
    themeId,
    size,
    kicker,
    showKicker,
    title,
    subtitle,
    credit,
    dateText,
    domain,
    facebook,
    accent,
    ink,
    titleScale,
    zoom,
    focusY,
    darkness,
    showLogo,
    showGrain,
    imgSrc,
  ]);

  useEffect(() => {
    void draw();
  }, [draw]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const download = (type: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement("a");
      link.download = `photocard-${themeId}-${Date.now()}.${type === "png" ? "png" : "jpg"}`;
      link.href = canvas.toDataURL(type === "png" ? "image/png" : "image/jpeg", 0.95);
      link.click();
      toast.success("ফটোকার্ড ডাউনলোড হয়েছে");
    } catch {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    }
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) throw new Error("blob");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("ছবি কপি হয়েছে — সরাসরি পেস্ট করতে পারবেন");
    } catch {
      toast.error("কপি করা যায়নি, ডাউনলোড করে নিন");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-5 rounded-xl border border-border bg-card p-5">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">ফটোকার্ড জেনারেটর</h1>
          <p className="text-sm text-muted-foreground">
            প্রিমিয়াম থিম বেছে নিন, ছবি ও শিরোনাম দিন — সবকিছু নিজের মতো সাজিয়ে ডাউনলোড করুন।
          </p>
        </div>

        <div className="space-y-2">
          <Label>থিম</Label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTheme(t.id)}
                className={cn(
                  "rounded-lg border p-2.5 text-left transition",
                  themeId === t.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: t.accent, boxShadow: `0 0 0 2px ${t.ink}` }}
                  />
                  <span className="text-xs font-semibold leading-4">{t.name}</span>
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                  {t.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>কার্ডের আকার</Label>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSizeId(s.id)}
                className={cn(
                  "rounded-md border px-2 py-2 text-[11px] font-medium transition",
                  sizeId === s.id ? "border-primary bg-primary/5 text-primary" : "border-border",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>ছবি আপলোড</Label>
          <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div className="space-y-2">
            <Label>ক্যাটাগরি ব্যাজ</Label>
            <Input value={kicker} onChange={(e) => setKicker(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch checked={showKicker} onCheckedChange={setShowKicker} id="kicker-toggle" />
            <Label htmlFor="kicker-toggle" className="text-xs">
              দেখাও
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} />
        </div>

        <div className="space-y-2">
          <Label>উপ-শিরোনাম</Label>
          <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>ছবির ক্রেডিট / বক্তার নাম</Label>
            <Input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="ঐচ্ছিক" />
          </div>
          <div className="space-y-2">
            <Label>তারিখ</Label>
            <Input value={dateText} onChange={(e) => setDateText(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>ওয়েবসাইট</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ফেসবুক</Label>
            <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>অ্যাকসেন্ট রঙ</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>বেস রঙ</Label>
            <Input type="color" value={ink} onChange={(e) => setInk(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border/70 bg-muted/30 p-3">
          <SliderRow label="শিরোনামের আকার" value={titleScale} min={70} max={135} onChange={setTitleScale} suffix="%" />
          <SliderRow label="ছবির জুম" value={zoom} min={100} max={200} onChange={setZoom} suffix="%" />
          <SliderRow label="ছবির অবস্থান (উপর–নিচ)" value={focusY} min={0} max={100} onChange={setFocusY} suffix="%" />
          <SliderRow label="ছবির ছায়া" value={darkness} min={0} max={80} onChange={setDarkness} suffix="%" />
          <div className="flex items-center justify-between">
            <Label className="text-xs">লোগো দেখাও</Label>
            <Switch checked={showLogo} onCheckedChange={setShowLogo} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">প্রিমিয়াম গ্রেইন টেক্সচার</Label>
            <Switch checked={showGrain} onCheckedChange={setShowGrain} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={() => download("png")} className="flex-1">
            PNG ডাউনলোড
          </Button>
          <Button variant="secondary" onClick={() => download("jpeg")}>
            JPG
          </Button>
          <Button variant="outline" onClick={() => void copyToClipboard()}>
            কপি
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setImgSrc(null);
              setTitle("সন্ধ্যার সংবাদ");
              setSubtitle("আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।");
              setCredit("");
              setTitleScale(100);
              setZoom(100);
              setFocusY(50);
              setDarkness(35);
              applyTheme("signature");
            }}
          >
            রিসেট
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-center rounded-xl border border-border bg-muted/40 p-6">
        <div className="w-full max-w-[520px]">
          <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            className="w-full rounded-lg border border-border bg-white shadow-lg"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            প্রিভিউ ছোট করে দেখানো হচ্ছে — ডাউনলোড হবে {size.w}×{size.h} পিক্সেল।
          </p>
        </div>
      </div>
    </div>
  );
}

function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <Label className="text-xs">{props.label}</Label>
        <span className="text-muted-foreground">
          {props.value}
          {props.suffix ?? ""}
        </span>
      </div>
      <Slider
        value={[props.value]}
        min={props.min}
        max={props.max}
        step={1}
        onValueChange={(v) => props.onChange(v[0] ?? props.value)}
      />
    </div>
  );
}
