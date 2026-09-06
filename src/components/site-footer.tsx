import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Tv, Youtube } from "lucide-react";

import { categories } from "@/lib/news-data";
import logoAsset from "@/lib/logo";

const socials = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Youtube, label: "YouTube" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Linkedin, label: "LinkedIn" },
];

const extraLinks = [
  "আমাদের সম্পর্কে",
  "যোগাযোগ",
  "বিজ্ঞাপন",
  "গোপনীয়তা নীতি",
  "শর্তাবলি",
  "আর্কাইভ",
];

export function SiteFooter() {
  return (
    <footer className="mt-10">

      {/* main dark footer */}
      <div className="bg-ink text-ink-foreground border-t-4 border-primary">
        <div className="mx-auto max-w-[1360px] px-4 py-12">
          <div className="grid gap-12 md:grid-cols-12">
            {/* brand + editor info */}
            <div className="md:col-span-4">
              <Link to="/" className="inline-block transition-transform duration-300 hover:scale-[1.03] mb-6">
                <img 
                  src={logoAsset.url} 
                  alt="প্রভাতবাংলা" 
                  className="h-16 w-auto max-w-full object-contain" 
                />
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                সম্পাদক : <span className="text-ink-foreground">ইঞ্জিনিয়ার জাহাঙ্গীর আলম</span>
                <br />
                ব্যবস্থাপনা সম্পাদক: ইঞ্জিনিয়ার বুল্বুল বাহার
                <br />
                প্রকাশনায়: প্রভাতবাংলা মিডিয়া লিমিটেড
              </p>
              <div className="mt-4 flex gap-2">
                {socials.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex size-9 items-center justify-center border border-white/20 rounded-md transition-all hover:bg-primary hover:border-primary hover:scale-110"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* contact */}
            <div className="md:col-span-4 lg:pl-8">
              <h3 className="mb-6 border-b-2 border-primary/30 pb-2 font-display text-lg font-bold">
                যোগাযোগ
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-muted">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  বার্তাকক্ষ ও বাণিজ্যিক কার্যালয়: বাড়ি ১২২, রোড ১, বারিধারা ডিওএইচএস, ঢাকা ১২০৫
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  ফোন: ০১৩৩০৭০৯৯৫৩, ০১৭১০৪২৪২৪১
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  ইমেইল: news@provatbanglanews.com · info@provatbanglanews.com
                </li>
              </ul>
            </div>

            {/* other links + epaper */}
            <div className="md:col-span-4 lg:pl-8">
              <h3 className="mb-6 border-b-2 border-primary/30 pb-2 font-display text-lg font-bold">
                অন্যান্য
              </h3>
              <ul className="grid grid-cols-2 gap-y-2 text-sm text-ink-muted">
                {extraLinks.map((l) => (
                  <li key={l}>
                    {l === "আর্কাইভ" ? (
                      <Link 
                        to="/archive" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : l === "আমাদের সম্পর্কে" ? (
                      <Link 
                        to="/about-us" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : l === "বিজ্ঞাপন" ? (
                      <Link 
                        to="/advertisement" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : l === "শর্তাবলি" ? (
                      <Link 
                        to="/terms-and-conditions" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : l === "যোগাযোগ" ? (
                      <Link 
                        to="/contact" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : l === "গোপনীয়তা নীতি" ? (
                      <Link 
                        to="/privacy-policy" 
                        className="transition-colors hover:text-ink-foreground"
                      >
                        {l}
                      </Link>
                    ) : (
                      <a href="#" className="transition-colors hover:text-ink-foreground">
                        {l}
                      </a>
                    )}
                  </li>
                ))}
                <li>
                  <Link to="/live-tv" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-foreground">
                    <Tv className="h-3.5 w-3.5 text-primary" />
                    লাইভ টিভি
                  </Link>
                </li>
                <li>
                  <Link to="/epaper" className="transition-colors hover:text-ink-foreground">
                    ই-পেপার
                  </Link>
                </li>

              </ul>
              <Link
                to="/epaper"
                className="mt-4 inline-block bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                আজকের ই-পেপার পড়ুন
              </Link>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/5 bg-black/20">
          <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-4 py-6 text-[13px] text-ink-muted md:flex-row">
            <span className="font-medium">© ২০২৬ প্রভাতবাংলা । সর্বস্বত্ব সংরক্ষিত।</span>
            <span>
              প্রকাশনায়: প্রভাতবাংলা মিডিয়া লিমিটেড
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
