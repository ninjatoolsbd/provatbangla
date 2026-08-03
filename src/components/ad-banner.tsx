import { cn } from "@/lib/utils";

export type DemoAd = {
  brand: string;
  headline: string;
  sub: string;
  cta: string;
  from: string;
  to: string;
  fg: string;
};

// kalbela.com-এর ফাঁকা বিজ্ঞাপন স্লটগুলোর জায়গায় ডেমো ব্যানার।
export const demoAds: DemoAd[] = [
  {
    brand: "প্রভাত ব্যাংক",
    headline: "সঞ্চয়ে এখন ৯.৫% মুনাফা",
    sub: "ডিপিএস খুলুন ঘরে বসেই, মাত্র ২ মিনিটে",
    cta: "এখনই খুলুন",
    from: "#0f3d2e",
    to: "#1f7a52",
    fg: "#eafff4",
  },
  {
    brand: "রূপসী টেলিকম",
    headline: "৪০ জিবি ইন্টারনেট ৩৪৯ টাকায়",
    sub: "৩০ দিন মেয়াদ • আনলিমিটেড রাতের ডাটা",
    cta: "কিনুন",
    from: "#7a1020",
    to: "#c02942",
    fg: "#fff1f3",
  },
  {
    brand: "মেঘনা প্রপার্টিজ",
    headline: "ঢাকায় নিজের ফ্ল্যাট এখন সহজ",
    sub: "০ ডাউনপেমেন্টে বুকিং, ১৫ বছরের কিস্তি",
    cta: "বিস্তারিত",
    from: "#122a52",
    to: "#2f6ab5",
    fg: "#eef5ff",
  },
  {
    brand: "সোনালী মোটরস",
    headline: "নতুন হাইব্রিড গাড়ি, কম খরচে বেশি পথ",
    sub: "টেস্ট ড্রাইভ বুক করুন আজই",
    cta: "বুক করুন",
    from: "#3a2a08",
    to: "#b58b19",
    fg: "#fff8e6",
  },
  {
    brand: "নিরাময় হাসপাতাল",
    headline: "ফুল বডি হেলথ চেকআপ ২,৯৯০ টাকা",
    sub: "৫০+ টেস্ট • রিপোর্ট ২৪ ঘণ্টায়",
    cta: "অ্যাপয়েন্টমেন্ট",
    from: "#062b32",
    to: "#128ea0",
    fg: "#e8fbff",
  },
  {
    brand: "দারুচিনি ফুডস",
    headline: "খাঁটি সরিষার তেল, সরাসরি ঘানি থেকে",
    sub: "সারাদেশে ফ্রি ডেলিভারি",
    cta: "অর্ডার করুন",
    from: "#4a1f05",
    to: "#d2691e",
    fg: "#fff4e8",
  },
];

export function AdBanner({
  index = 0,
  variant = "leaderboard",
  className,
}: {
  index?: number;
  variant?: "leaderboard" | "box" | "skyscraper";
  className?: string;
}) {
  const ad = demoAds[Math.abs(index) % demoAds.length]!;
  const vertical = variant === "skyscraper";

  return (
    <div className={cn("relative overflow-hidden border border-border", className)}>
      <span className="absolute right-1 top-1 z-10 bg-black/45 px-1.5 py-0.5 text-[10px] leading-none text-white">
        বিজ্ঞাপন
      </span>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className={cn(
          "group flex h-full w-full items-center gap-4 p-4 transition-transform duration-300",
          vertical && "flex-col justify-center text-center",
          variant === "box" && "flex-col justify-center text-center",
        )}
        style={{
          backgroundImage: `linear-gradient(135deg, ${ad.from}, ${ad.to})`,
          color: ad.fg,
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest opacity-80">
          {ad.brand}
        </span>
        <span className="flex-1">
          <span className="block text-lg font-black leading-snug md:text-xl">
            {ad.headline}
          </span>
          <span className="mt-1 block text-xs opacity-85">{ad.sub}</span>
        </span>
        <span className="inline-block shrink-0 border border-current px-3 py-1.5 text-xs font-bold transition-colors group-hover:bg-white/15">
          {ad.cta}
        </span>
      </a>
    </div>
  );
}
