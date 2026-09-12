import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type TemplateId = "classic" | "bottombar" | "overlay";

const TEMPLATES: { id: TemplateId; name: string; hint: string }[] = [
  { id: "classic", name: "ক্লাসিক (ছবি + নিচে লাল প্যানেল)", hint: "স্ক্রিনশটের মতো ডিজাইন" },
  { id: "bottombar", name: "ফুল ছবি + নিচে কালো বার", hint: "বড় ছবির উপর শিরোনাম" },
  { id: "overlay", name: "গ্রেডিয়েন্ট ওভারলে", hint: "ছবির উপরে গাঢ় শেড ও শিরোনাম" },
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
    const logo = await loadImg(logoAsset.url);

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

    if (logo) {
      const lw = 230;
      const lh = (logo.height / logo.width) * lw;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(44, 44, lw + 24, lh + 16);
      ctx.drawImage(logo, 56, 52, lw, lh);
      ctx.restore();
    }
  }, [template, title, subtitle, dateText, domain, facebook, accent, imgSrc]);

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
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>তারিখ</Label>
            <Input value={dateText} onChange={(e) => setDateText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>রঙ</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
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

        <div className="flex gap-3 pt-2">
          <Button onClick={download} className="flex-1">
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

      <div className="flex items-start justify-center rounded-xl border border-border bg-muted/40 p-6">
        <div className="w-full max-w-[560px]">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="w-full rounded-lg border border-border bg-white shadow-sm"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            প্রিভিউ ছোট করে দেখানো হচ্ছে — ডাউনলোড হবে ১০৮০×১০৮০ পিক্সেল।
          </p>
        </div>
      </div>
    </div>
  );
}
