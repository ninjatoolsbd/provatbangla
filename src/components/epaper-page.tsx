import logoAsset from "@/lib/site-logo";

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
    <div className={`relative aspect-[3/4] w-full overflow-hidden bg-[#f7f4ec] shadow-inner ${className}`}>
      <img
        src={epaperPageImage(pageNo)}
        alt={`প্রভাতবাংলা ই-পেপার — পৃষ্ঠা ${pageNo}, ${label}, ${date}`}
        loading="lazy"
        className="h-full w-full object-cover object-top"
      />
      
      {/* Overlay to cover the Kalbela logo on the paper scan */}
      <div className="absolute top-[2%] left-[30%] w-[40%] h-[8%] bg-[#f7f4ec] flex items-center justify-center">
        <img 
          src={logoAsset.url} 
          alt="প্রভাতবাংলা" 
          className="h-full w-auto object-contain max-h-[80%]" 
        />
      </div>
    </div>
  );
}
