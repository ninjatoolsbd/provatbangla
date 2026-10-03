import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchSettings } from "@/lib/cms";
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

type TemplateId =
  | "classic" | "bottombar" | "overlay" | "split"
  | "prothomalo" | "rtv" | "breaking" | "quote";

const TEMPLATES: { id: TemplateId; name: string; hint: string }[] = [
  { id: "classic", name: "ক্লাসিক (ছবি + নিচে লাল প্যানেল)", hint: "স্ক্রিনশটের মতো ডিজাইন" },
  { id: "bottombar", name: "ফুল ছবি + নিচে কালো বার", hint: "বড় ছবির উপর শিরোনাম" },
  { id: "overlay", name: "গ্রেডিয়েন্ট ওভারলে", hint: "ছবির উপরে গাঢ় শেড ও শিরোনাম" },
  { id: "split", name: "লাল-সবুজ ফ্রেম (লোগো মাঝে)", hint: "উপরে তারিখ, ফ্রেমে ছবি, নিচে শিরোনাম ও কমলা বাটন" },
  { id: "prothomalo", name: "প্রথম আলো স্টাইল (সাদা কার্ড)", hint: "উপরে ছবি, লাল তারিখ ট্যাগ, সাদা জমিনে গাঢ় শিরোনাম" },
  { id: "rtv", name: "টিভি চ্যানেল স্টাইল (RTV-এর মতো)", hint: "ফুল ছবি, লাল লেবেল, সাদা শিরোনাম বক্স, লাল ফুটার" },
  { id: "breaking", name: "ব্রেকিং নিউজ (হলুদ-লাল)", hint: "উপরে ব্রেকিং ব্যানার, মাঝে ছবি, কালো জমিনে শিরোনাম" },
  { id: "quote", name: "উদ্ধৃতি কার্ড (বক্তব্য)", hint: "শিরোনামে বক্তব্য, উপশিরোনামে বক্তার নাম; গোল ছবি" },
];

const SIZE = 1080;

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
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

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ratio = Math.max(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export const Route = createFileRoute("/admin/photocard")({
  head: () =>
    meta(
      "ফটোকার্ড জেনারেটর — প্রভাতবাংলা অ্যাডমিন",
      "নিউজ ছবি ও শিরোনাম দিয়ে সোশ্যাল মিডিয়ার ফটোকার্ড তৈরি ও ডাউনলোড করুন।",
    ),
  component: PhotocardGenerator,
});

function PhotocardGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settings = useQuery({ queryKey: ["cms", "settings"], queryFn: fetchSettings });
  const watermarkLogoUrl = settings.data?.["watermark_logo_url"] || logoAsset.url;
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [title, setTitle] = useState("সন্ধ্যার সংবাদ");
  const [subtitle, setSubtitle] = useState("আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।");
  const [dateText, setDateText] = useState(
    new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
  );
  const [domain, setDomain] = useState("www.provatbanglanews.com");
  const [facebook, setFacebook] = useState("provatbangla");
  const [accent, setAccent] = useState("#9B0E13");
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
      });

    const photo = imgSrc ? await loadImg(imgSrc) : null;
    // অটো নিউজ সেটিংসে নির্বাচিত সর্বশেষ ওয়াটারমার্ক লোগোটিই ব্যবহার হবে
    const logo = await loadImg(watermarkLogoUrl);

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    const font = (size: number, weight = "700") =>
      `${weight} ${size}px "SolaimanLipi", "Noto Sans Bengali", "Hind Siliguri", system-ui, sans-serif`;

    if (template === "classic") {
      // outer accent border
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, SIZE, SIZE);
      const pad = 18;
      const imgH = 660;
      ctx.fillStyle = "#eef0f2";
      ctx.fillRect(pad, pad, SIZE - pad * 2, imgH);
      if (photo) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad, pad, SIZE - pad * 2, imgH);
        ctx.clip();
        drawCover(ctx, photo, pad, pad, SIZE - pad * 2, imgH);
        ctx.restore();
      } else {
        ctx.fillStyle = "#9aa0a6";
        ctx.font = font(96);
        ctx.textAlign = "center";
        ctx.fillText("IMAGE", SIZE / 2, pad + imgH / 2 + 34);
      }

      // text panel
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = font(58);
      const titleLines = wrapLines(ctx, title, SIZE - 160, 2);
      let y = pad + imgH + 90;
      for (const line of titleLines) {
        ctx.fillText(line, SIZE / 2, y);
        y += 70;
      }
      ctx.font = font(30, "400");
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      for (const line of wrapLines(ctx, subtitle, SIZE - 200, 2)) {
        ctx.fillText(line, SIZE / 2, y);
        y += 42;
      }
      ctx.textAlign = "right";
      ctx.font = font(26, "500");
      ctx.fillText(dateText, SIZE - 60, Math.min(y + 14, SIZE - 120));

      // footer strip
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(pad, SIZE - 92, SIZE - pad * 2, 92 - pad);
      ctx.fillStyle = "#ffffff";
      ctx.font = font(28, "600");
      ctx.textAlign = "left";
      ctx.fillText(domain, 60, SIZE - 40);
      ctx.textAlign = "right";
      ctx.fillText(facebook, SIZE - 60, SIZE - 40);
    }

    if (template === "bottombar") {
      if (photo) drawCover(ctx, photo, 0, 0, SIZE, SIZE);
      else {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      const barH = 320;
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      ctx.fillRect(0, SIZE - barH, SIZE, barH);
      ctx.fillStyle = accent;
      ctx.fillRect(0, SIZE - barH, SIZE, 10);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = font(54);
      let y = SIZE - barH + 90;
      for (const line of wrapLines(ctx, title, SIZE - 120, 3)) {
        ctx.fillText(line, 60, y);
        y += 68;
      }
      ctx.font = font(26, "500");
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`${domain}  •  ${dateText}`, 60, SIZE - 40);
    }

    if (template === "overlay") {
      if (photo) drawCover(ctx, photo, 0, 0, SIZE, SIZE);
      else {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      const grad = ctx.createLinearGradient(0, SIZE * 0.35, 0, SIZE);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.fillStyle = accent;
      ctx.fillRect(60, SIZE - 430, 120, 8);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.font = font(56);
      let y = SIZE - 350;
      for (const line of wrapLines(ctx, title, SIZE - 120, 3)) {
        ctx.fillText(line, 60, y);
        y += 70;
      }
      ctx.font = font(28, "400");
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const line of wrapLines(ctx, subtitle, SIZE - 140, 2)) {
        ctx.fillText(line, 60, y);
        y += 40;
      }
      ctx.font = font(26, "600");
      ctx.fillText(`${domain}  •  ${dateText}`, 60, SIZE - 50);
    }

    if (template === "split") {
      // উপরে লাল, নিচে কালো — লোগোর রঙে
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(0, 0, SIZE, 380);
      ctx.fillStyle = "#0B5D2A";
      ctx.fillRect(0, 380, SIZE, SIZE - 380);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = font(30, "600");
      ctx.fillText(dateText, SIZE / 2, 58);

      // সাদা ফ্রেম + লাল-কালো গ্রেডিয়েন্ট ভেতরের বর্ডার
      const fx = 40, fy = 86, fw = SIZE - 80, fh = 490;
      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
      };
      ctx.fillStyle = "#ffffff";
      rr(fx, fy, fw, fh, 22);
      ctx.fill();
      const g = ctx.createLinearGradient(fx, 0, fx + fw, 0);
      g.addColorStop(0, "#ED1C24");
      g.addColorStop(1, "#0B5D2A");
      ctx.fillStyle = g;
      rr(fx + 8, fy + 8, fw - 16, fh - 16, 16);
      ctx.fill();
      const px = fx + 18, py = fy + 18, pw = fw - 36, ph = fh - 36;
      ctx.save();
      rr(px, py, pw, ph, 10);
      ctx.clip();
      if (photo) drawCover(ctx, photo, px, py, pw, ph);
      else {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(px, py, pw, ph);
      }
      ctx.restore();

      // লোগো সাদা বক্সে, ফ্রেমের নিচে মাঝখানে
      const bw = 340, bh = 130;
      const bx = (SIZE - bw) / 2, by = fy + fh - 60;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ffffff";
      rr(bx, by, bw, bh, 12);
      ctx.fill();
      ctx.restore();
      if (logo) {
        const s = Math.min((bw - 30) / logo.width, (bh - 20) / logo.height);
        const lw2 = logo.width * s, lh2 = logo.height * s;
        ctx.drawImage(logo, bx + (bw - lw2) / 2, by + (bh - lh2) / 2, lw2, lh2);
      }

      // শিরোনাম
      ctx.fillStyle = "#ffffff";
      ctx.font = font(54);
      let y = by + bh + 80;
      for (const line of wrapLines(ctx, title, SIZE - 120, 2)) {
        ctx.fillText(line, SIZE / 2, y);
        y += 68;
      }

      // হলুদ পিল
      ctx.font = font(30, "600");
      const pill = subtitle || "বিস্তারিত কমেন্টে...";
      const tw = Math.min(ctx.measureText(pill).width + 60, SIZE - 160);
      const pyy = Math.min(y - 10, SIZE - 170);
      ctx.fillStyle = "#F7941D";
      rr((SIZE - tw) / 2, pyy, tw, 62, 12);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(pill, SIZE / 2, pyy + 42, tw - 30);

      // লাল ফুটার বার
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(40, SIZE - 88, SIZE - 80, 62);
      ctx.fillStyle = "#ffffff";
      ctx.font = font(28, "500");
      ctx.fillText(domain, SIZE / 2, SIZE - 47);
    }

    const rrect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };
    const photoOrBlank = (x: number, y: number, w: number, h: number) => {
      if (photo) drawCover(ctx, photo, x, y, w, h);
      else {
        ctx.fillStyle = "#d9dde2";
        ctx.fillRect(x, y, w, h);
      }
    };

    // প্রথম আলো স্টাইল — সাদা কার্ড, উপরে ছবি, গাঢ় শিরোনাম, লাল উদ্ধৃতি-চিহ্ন
    if (template === "prothomalo") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SIZE, SIZE);
      const imgH = 600;
      photoOrBlank(0, 0, SIZE, imgH);
      // ছবির নিচে পাতলা লাল লাইন
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(0, imgH, SIZE, 8);
      // ক্যাটাগরি/তারিখ ট্যাগ
      ctx.font = font(26, "700");
      const tag = dateText;
      const tagW = ctx.measureText(tag).width + 44;
      ctx.fillStyle = "#ED1C24";
      rrect(60, imgH - 26, tagW, 52, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(tag, 82, imgH + 9);
      // শিরোনাম
      ctx.fillStyle = "#111111";
      ctx.font = font(60, "700");
      let y = imgH + 115;
      for (const line of wrapLines(ctx, title, SIZE - 120, 3)) {
        ctx.fillText(line, 60, y);
        y += 74;
      }
      ctx.font = font(30, "400");
      ctx.fillStyle = "#4b5563";
      for (const line of wrapLines(ctx, subtitle, SIZE - 120, 1)) {
        ctx.fillText(line, 60, Math.min(y + 4, SIZE - 120));
      }
      // ফুটার
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(60, SIZE - 96, SIZE - 120, 2);
      ctx.fillStyle = "#6b7280";
      ctx.font = font(26, "500");
      ctx.fillText(domain, 60, SIZE - 44);
    }

    // আরটিভি স্টাইল — ফুল ছবি, লাল বাঁকা ব্যান্ড, সাদা শিরোনাম বক্স
    if (template === "rtv") {
      photoOrBlank(0, 0, SIZE, SIZE);
      const shade = ctx.createLinearGradient(0, SIZE * 0.45, 0, SIZE);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, SIZE, SIZE);
      // উপরে বাঁ কোণে লাল লেবেল
      ctx.fillStyle = "#ED1C24";
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(360, 50);
      ctx.lineTo(320, 122);
      ctx.lineTo(0, 122);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = font(36, "700");
      ctx.textAlign = "left";
      ctx.fillText("সর্বশেষ সংবাদ", 40, 100);
      // সাদা শিরোনাম বক্স, বাঁ পাশে লাল স্ট্রাইপ
      ctx.font = font(52, "700");
      const lines = wrapLines(ctx, title, SIZE - 200, 3);
      const boxH = lines.length * 66 + 70;
      const boxY = SIZE - 150 - boxH;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(50, boxY, SIZE - 100, boxH);
      ctx.restore();
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(50, boxY, 14, boxH);
      ctx.fillStyle = "#111111";
      let y = boxY + 80;
      for (const line of lines) {
        ctx.fillText(line, 96, y);
        y += 66;
      }
      // নিচে লাল বার
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(0, SIZE - 110, SIZE, 110);
      ctx.fillStyle = "#ffffff";
      ctx.font = font(28, "600");
      ctx.fillText(`${dateText}  |  ${domain}`, 50, SIZE - 45);
    }

    // ব্রেকিং নিউজ — হলুদ-লাল ব্যানার
    if (template === "breaking") {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, SIZE, SIZE);
      photoOrBlank(0, 140, SIZE, 520);
      // উপরের ব্যানার
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(0, 0, SIZE, 140);
      ctx.fillStyle = "#FFD400";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(430, 0);
      ctx.lineTo(380, 140);
      ctx.lineTo(0, 140);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#111111";
      ctx.font = font(58, "700");
      ctx.textAlign = "left";
      ctx.fillText("ব্রেকিং", 50, 92);
      ctx.fillStyle = "#ffffff";
      ctx.font = font(48, "700");
      ctx.fillText("নিউজ", 420, 92);
      ctx.font = font(26, "500");
      ctx.textAlign = "right";
      ctx.fillText(dateText, SIZE - 40, 88);
      // হলুদ রেখা
      ctx.fillStyle = "#FFD400";
      ctx.fillRect(0, 660, SIZE, 10);
      // শিরোনাম
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = font(56, "700");
      let y = 760;
      for (const line of wrapLines(ctx, title, SIZE - 120, 3)) {
        ctx.fillText(line, 60, y);
        y += 70;
      }
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = font(26, "500");
      ctx.fillText(domain, 60, SIZE - 40);
    }

    // উদ্ধৃতি কার্ড — বক্তব্য/মন্তব্যের জন্য
    if (template === "quote") {
      const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      bg.addColorStop(0, "#111111");
      bg.addColorStop(1, "#3a0507");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);
      // ডানে গোল ছবি
      const cx = SIZE - 250, cy = 260, r = 190;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      photoOrBlank(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = "#ED1C24";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.stroke();
      // বড় উদ্ধৃতি চিহ্ন
      ctx.fillStyle = "#ED1C24";
      ctx.font = `700 260px Georgia, serif`;
      ctx.textAlign = "left";
      ctx.fillText("“", 50, 300);
      // উদ্ধৃতি
      ctx.fillStyle = "#ffffff";
      ctx.font = font(58, "700");
      let y = 540;
      for (const line of wrapLines(ctx, title, SIZE - 140, 4)) {
        ctx.fillText(line, 70, y);
        y += 76;
      }
      ctx.fillStyle = "#ED1C24";
      ctx.fillRect(70, y - 20, 90, 6);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = font(32, "600");
      ctx.fillText(`— ${subtitle}`, 70, y + 36, SIZE - 140);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = font(26, "500");
      ctx.fillText(`${dateText}  •  ${domain}`, 70, SIZE - 50);
    }

    if (logo && template !== "split") {
      const lw = 170;
      const lh = (logo.height / logo.width) * lw;
      const logoX = template === "classic" ? (SIZE - lw) / 2 : SIZE - lw - 38;
      const logoY = SIZE - lh - 20;
      // লোগোর সাদা ব্যাকগ্রাউন্ড স্বচ্ছ করে আঁকা হচ্ছে (কোনো বক্স নয়)
      const off = document.createElement("canvas");
      off.width = Math.round(lw * 2);
      off.height = Math.round(lh * 2);
      const octx = off.getContext("2d");
      let src: CanvasImageSource = logo;
      if (octx) {
        octx.drawImage(logo, 0, 0, off.width, off.height);
        try {
          const d = octx.getImageData(0, 0, off.width, off.height);
          const p = d.data;
          for (let i = 0; i < p.length; i += 4) {
            const m = Math.min(p[i] ?? 0, p[i + 1] ?? 0, p[i + 2] ?? 0);
            if (m > 235) p[i + 3] = 0;
            else if (m > 200) p[i + 3] = Math.round((p[i + 3] ?? 255) * ((235 - m) / 35));
          }
          octx.putImageData(d, 0, 0);
          src = off;
        } catch {
          // CORS হলে আসল লোগোই বসবে
        }
      }
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 6;
      ctx.drawImage(src, logoX, logoY, lw, lh);
      ctx.restore();
    }
  }, [template, title, subtitle, dateText, domain, facebook, accent, imgSrc, watermarkLogoUrl]);

  useEffect(() => {
    void draw();
  }, [draw]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement("a");
      link.download = `photocard-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ফটোকার্ড ডাউনলোড হয়েছে");
    } catch {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="grid gap-4 pb-20 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6 lg:pb-0">
      <div className="order-2 min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5 lg:order-1">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">ফটোকার্ড জেনারেটর</h1>
          <p className="text-sm text-muted-foreground">
            ছবি আপলোড করুন, শিরোনাম দিন — টেমপ্লেট অনুযায়ী ১০৮০×১০৮০ ফটোকার্ড তৈরি হবে।
          </p>
        </div>

        <div className="space-y-2">
          <Label>টেমপ্লেট</Label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateId)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {TEMPLATES.find((t) => t.id === template)?.hint}
          </p>
        </div>

        <div className="space-y-2">
          <Label>ছবি আপলোড</Label>
          <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        <div className="space-y-2">
          <Label>শিরোনাম</Label>
          <Textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} />
        </div>

        <div className="space-y-2">
          <Label>উপ-শিরোনাম</Label>
          <Textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} />
        </div>

        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          <div className="space-y-2">
            <Label>তারিখ</Label>
            <Input value={dateText} onChange={(e) => setDateText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>রঙ</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          <div className="space-y-2">
            <Label>ওয়েবসাইট</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ফেসবুক</Label>
            <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-3 border-t border-border bg-background p-3 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:pt-2">
          <Button onClick={download} className="h-11 flex-1 lg:h-10">
            ডাউনলোড করুন
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImgSrc(null);
              setTitle("সন্ধ্যার সংবাদ");
              setSubtitle("আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।");
            }}
          >
            রিসেট
          </Button>
        </div>
      </div>

      <div className="sticky top-12 z-10 order-1 flex min-w-0 items-start justify-center rounded-xl border border-border bg-muted p-2 sm:p-4 lg:static lg:order-2 lg:bg-muted/40 lg:p-6">
        <div className="w-full max-w-[260px] sm:max-w-[360px] lg:max-w-[560px]">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded-lg border border-border bg-white shadow-sm"
          />
          <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
            প্রিভিউ ছোট করে দেখানো হচ্ছে — ডাউনলোড হবে ১০৮০×১০৮০ পিক্সেল।
          </p>
        </div>
      </div>
    </div>
  );
}
