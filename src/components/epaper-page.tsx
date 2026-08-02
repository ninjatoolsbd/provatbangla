type Props = {
  pageNo: number;
  label: string;
  date?: string;
  className?: string;
};

const EPAPER_BASE = "https://epaper.kalbela.com/2026/08/02/2nd-Edition/pages";

export const epaperPageImage = (pageNo: number) =>
  `${EPAPER_BASE}/page${String(pageNo).padStart(2, "0")}.jpg`;

/** Renders a real printed-newspaper page scan (temporary demo assets from kalbela). */
export function EpaperPage({ pageNo, label, date = "২ আগস্ট ২০২৬, রোববার", className = "" }: Props) {
  return (
    <img
      src={epaperPageImage(pageNo)}
      alt={`কালবেলা ই-পেপার — পৃষ্ঠা ${pageNo}, ${label}, ${date}`}
      loading="lazy"
      className={`aspect-[3/4] w-full bg-[#f7f4ec] object-cover object-top shadow-inner ${className}`}
    />
  );
}
