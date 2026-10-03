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
import { DEFAULT_TEMPLATE, SIZE, TEMPLATES, renderPhotocard, type TemplateId } from "@/lib/photocard-render";

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
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
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

    await renderPhotocard(canvas, { template, title, subtitle, dateText, domain, facebook, accent, imgSrc, watermarkLogoUrl });
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
