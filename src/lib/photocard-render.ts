/**
 * ফটোকার্ড আঁকার শেয়ার্ড লজিক — ফটোকার্ড পাতা ও নিউজ প্রকাশের পপআপ দুটোই এটি ব্যবহার করে।
 */
export type TemplateId =
  | "classic" | "bottombar" | "overlay" | "split"
  | "prothomalo" | "rtv" | "breaking" | "quote";

export const TEMPLATES: { id: TemplateId; name: string; hint: string }[] = [
  { id: "classic", name: "ক্লাসিক (ছবি + নিচে লাল প্যানেল)", hint: "স্ক্রিনশটের মতো ডিজাইন" },
  { id: "bottombar", name: "ফুল ছবি + নিচে কালো বার", hint: "বড় ছবির উপর শিরোনাম" },
  { id: "overlay", name: "গ্রেডিয়েন্ট ওভারলে", hint: "ছবির উপরে গাঢ় শেড ও শিরোনাম" },
  { id: "split", name: "লাল-সবুজ ফ্রেম (লোগো মাঝে)", hint: "উপরে তারিখ, ফ্রেমে ছবি, নিচে শিরোনাম ও কমলা বাটন" },
  { id: "prothomalo", name: "প্রথম আলো স্টাইল (সাদা কার্ড)", hint: "উপরে ছবি, লাল তারিখ ট্যাগ, সাদা জমিনে গাঢ় শিরোনাম" },
  { id: "rtv", name: "টিভি চ্যানেল স্টাইল (RTV-এর মতো)", hint: "ফুল ছবি, লাল লেবেল, সাদা শিরোনাম বক্স, লাল ফুটার" },
  { id: "breaking", name: "ব্রেকিং নিউজ (হলুদ-লাল)", hint: "উপরে ব্রেকিং ব্যানার, মাঝে ছবি, কালো জমিনে শিরোনাম" },
  { id: "quote", name: "উদ্ধৃতি কার্ড (বক্তব্য)", hint: "শিরোনামে বক্তব্য, উপশিরোনামে বক্তার নাম; গোল ছবি" },
];

export const SIZE = 1080;

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

/** ডিফল্ট টেমপ্লেট — লাল-সবুজ ফ্রেম। */
export const DEFAULT_TEMPLATE: TemplateId = "split";

export type PhotocardOptions = {
  template: TemplateId;
  title: string;
  subtitle: string;
  dateText: string;
  domain: string;
  facebook: string;
  accent: string;
  imgSrc: string | null;
  watermarkLogoUrl: string;
};

export async function renderPhotocard(canvas: HTMLCanvasElement, opts: PhotocardOptions) {
  const { template, title, subtitle, dateText, domain, facebook, accent, imgSrc, watermarkLogoUrl } = opts;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  void facebook;
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
}

/** ছবিকে data URL বানায়, যাতে ক্যানভাস "tainted" না হয় ও ডাউনলোড চলে। */
async function toDataUrl(url: string): Promise<string | null> {
  const tryFetch = async (u: string) => {
    try {
      const res = await fetch(u, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) return null;
      return await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };
  const direct = await tryFetch(url);
  if (direct) return direct;
  // R2 ছবি হলে নিজের সাইটের প্রক্সি দিয়ে চেষ্টা
  try {
    const path = new URL(url, window.location.origin).pathname.replace(/^\/+/, "");
    return await tryFetch(`/api/public/r2/${path}`);
  } catch {
    return null;
  }
}

/** ডিফল্ট টেমপ্লেটে একটি নিউজের ফটোকার্ড তৈরি করে সাথে সাথে ডাউনলোড করে। */
export async function generateAndDownloadPhotocard(input: {
  title: string;
  imageUrl?: string | null;
  watermarkLogoUrl: string;
}) {
  const imgSrc = input.imageUrl ? await toDataUrl(input.imageUrl) : null;
  const canvas = document.createElement("canvas");
  await renderPhotocard(canvas, {
    template: DEFAULT_TEMPLATE,
    title: input.title,
    subtitle: "বিস্তারিত কমেন্টে...",
    dateText: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
    domain: "www.provatbanglanews.com",
    facebook: "provatbangla",
    accent: "#9B0E13",
    imgSrc,
    watermarkLogoUrl: input.watermarkLogoUrl,
  });
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("ফটোকার্ড তৈরি করা যায়নি");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `photocard-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
