import { articles } from "@/lib/news-data";

const bn = (n: number | string) =>
  String(n)
    .split("")
    .map((d) => ("০১২৩৪৫৬৭৮৯"[Number(d)] ?? d))
    .join("");

type Props = {
  pageNo: number;
  label: string;
  date?: string;
  className?: string;
};

/** Renders a printed-newspaper style page mock (no stock photos). */
export function EpaperPage({ pageNo, label, date = "২ আগস্ট ২০২৬, রোববার", className = "" }: Props) {
  const start = (pageNo - 1) * 5;
  const items = Array.from({ length: 7 }, (_, i) => articles[(start + i) % articles.length]!);
  const lead = items[0]!;

  return (
    <div
      className={`aspect-[3/4] w-full overflow-hidden bg-[#f7f4ec] p-[3%] text-foreground shadow-inner ${className}`}
    >
      {/* masthead */}
      <div className="border-b-4 border-double border-foreground/70 pb-[1.5%] text-center">
        <div className="font-display text-[7cqw] font-extrabold leading-none tracking-tight text-primary">
          কালবেলা
        </div>
        <div className="mt-[1%] flex items-center justify-between border-t border-foreground/30 pt-[1%] text-[2.2cqw] text-foreground/70">
          <span>{date}</span>
          <span>
            পৃষ্ঠা {bn(pageNo)} · {label}
          </span>
        </div>
      </div>

      {/* lead headline */}
      <div className="mt-[2.5%] border-b border-foreground/25 pb-[2%]">
        <h3 className="text-center font-serif text-[4.6cqw] font-extrabold leading-snug">
          {lead.title}
        </h3>
        <p className="mt-[1.5%] text-justify text-[2.3cqw] leading-relaxed text-foreground/75">
          {lead.excerpt}
        </p>
      </div>

      {/* three column body */}
      <div className="mt-[2.5%] grid grid-cols-3 gap-[3%]">
        {items.slice(1, 4).map((a) => (
          <div key={a.id} className="border-r border-foreground/15 pr-[4%] last:border-r-0">
            <h4 className="font-serif text-[2.8cqw] font-bold leading-snug">{a.title}</h4>
            <div className="mt-[6%] space-y-[6%]">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[0.6cqw] bg-foreground/15"
                  style={{ width: `${72 + ((i * 13) % 28)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[3%] grid grid-cols-2 gap-[3%] border-t border-foreground/25 pt-[2.5%]">
        {items.slice(4, 6).map((a) => (
          <div key={a.id}>
            <h4 className="font-serif text-[2.6cqw] font-bold leading-snug">{a.title}</h4>
            <div className="mt-[4%] space-y-[5%]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[0.6cqw] bg-foreground/15"
                  style={{ width: `${68 + ((i * 17) % 30)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
