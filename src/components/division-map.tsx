import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DIVISIONS, MAP_H, MAP_W } from "@/lib/bd-divisions-map";
import { fetchPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { ThumbRow } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";

/** বিভাগভিত্তিক জেলা তালিকা — খবরের location মিলিয়ে ফিল্টার করতে ব্যবহৃত */
const DIVISION_DISTRICTS: Record<string, string[]> = {
  Dhaka: [
    "ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "নরসিংদী", "মানিকগঞ্জ", "মুন্শিগঞ্জ", "মুন্সিগঞ্জ",
    "টাঙ্গাইল", "কিশোরগঞ্জ", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "রাজবাড়ী", "শরীয়তপুর",
  ],
  Chattogram: [
    "চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "ফেনী", "লক্ষ্মীপুর",
    "নোয়াখালী", "রাঙামাটি", "খাগড়াছড়ি", "বান্দরবান",
  ],
  Rajshahi: [
    "রাজশাহী", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা", "সিরাজগঞ্জ", "বগুড়া", "জয়পুরহাট",
  ],
  Khulna: [
    "খুলনা", "যশোর", "সাতক্ষীরা", "বাগেরহাট", "ঝিনাইদহ", "মাগুরা", "নড়াইল", "কুষ্টিয়া",
    "চুয়াডাঙ্গা", "মেহেরপুর",
  ],
  Barishal: ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"],
  Sylhet: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  Rangpur: [
    "রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও",
  ],
  Mymensingh: ["ময়মনসিংহ", "জামালপুর", "নেত্রকোনা", "শেরপুর"],
};

/** বিভাগের নিজের নামও ম্যাচ তালিকায় যোগ হয় */
const DIVISION_NAMES: Record<string, string> = {
  Dhaka: "ঢাকা",
  Chattogram: "চট্টগ্রাম",
  Rajshahi: "রাজশাহী",
  Khulna: "খুলনা",
  Barishal: "বরিশাল",
  Sylhet: "সিলেট",
  Rangpur: "রংপুর",
  Mymensingh: "ময়মনসিংহ",
};

/** খবরের সব লেখা এক জায়গায় (location ফাঁকা থাকলেও অটো শনাক্ত করার জন্য) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function haystack(a: any) {
  return [a.location, a.title, a.kicker, a.excerpt, a.content]
    .filter(Boolean)
    .join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function newsOfDivision(en: string, pool: any[]) {
  const list = [DIVISION_NAMES[en] ?? "", ...(DIVISION_DISTRICTS[en] ?? [])].filter(Boolean);
  return pool.filter((a) => {
    const text = haystack(a);
    return list.some((d) => text.includes(d));
  });
}

export function DivisionMap() {
  const { data: pool = [] } = useQuery({
    queryKey: ["division-posts"],
    queryFn: () => fetchPublishedPosts(100),
  });
  const [active, setActive] = useState("Dhaka");
  const [hover, setHover] = useState<string | null>(null);

  const activeDiv = DIVISIONS.find((d) => d.en === active) ?? DIVISIONS[0]!;

  const items = useMemo(() => {
    const found = newsOfDivision(active, pool);
    if (found.length) return found.slice(0, 6);
    // ওই বিভাগের খবর না পেলে সর্বশেষ খবর দেখানো হয়
    return pool.slice(0, 6);
  }, [active, pool]);


  return (
    <div className="border border-border bg-card p-4">
      <BarHeading title="এক ক্লিকে বিভাগের খবর" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="mx-auto h-auto w-full max-w-[320px]"
            role="img"
            aria-label="বাংলাদেশের বিভাগভিত্তিক মানচিত্র"
          >
            {DIVISIONS.map((d) => {
              const on = d.en === active || d.en === hover;
              return (
                <path
                  key={d.en}
                  d={d.d}
                  onClick={() => setActive(d.en)}
                  onMouseEnter={() => setHover(d.en)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    "stroke-card",
                    on ? "fill-primary" : "fill-primary/70 hover:fill-primary",
                  )}
                  strokeWidth={on ? 3 : 1.5}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {DIVISIONS.map((d) => (
              <text
                key={`t-${d.en}`}
                x={d.lx}
                y={d.ly}
                textAnchor="middle"
                className="pointer-events-none select-none fill-primary-foreground font-display"
                fontSize={22}
                fontWeight={700}
                paintOrder="stroke"
              >
                {d.bn}
              </text>
            ))}
          </svg>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {DIVISIONS.map((d) => (
              <button
                key={`b-${d.en}`}
                onClick={() => setActive(d.en)}
                className={cn(
                  "border px-2.5 py-1 text-xs font-bold transition-colors",
                  d.en === active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                {d.bn}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <h3 className="mb-1 border-b border-border pb-2 font-display text-[18px] font-bold">
            <span className="text-primary">{activeDiv.bn}</span> বিভাগের খবর
          </h3>
          {items.map((a, i) => (
            <ThumbRow key={`${active}-${a.id}-${i}`} article={a as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
