import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { categories } from "@/lib/news-data";
import logoAsset from "@/assets/logo.png.asset.json";

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
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[1240px] px-4 py-9">
          <div className="grid gap-8 md:grid-cols-12">
            {/* brand + editor info */}
            <div className="md:col-span-4">
              <Link to="/" className="inline-block transition-transform duration-300 hover:scale-[1.03]">
                <img 
                  src={logoAsset.url} 
                  alt="প্রভাতবাংলা" 
                  className="h-12 w-auto object-contain brightness-0 invert" 
                />
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                সম্পাদক ও প্রকাশক: <span className="text-ink-foreground">ডেমো সম্পাদক</span>
                <br />
                ব্যবস্থাপনা সম্পাদক: ডেমো ব্যবস্থাপক
                <br />
                প্রকাশনায়: প্রভাতবাংলা ডেমো মিডিয়া লিমিটেড
              </p>
              <div className="mt-4 flex gap-2">
                {socials.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex size-9 items-center justify-center border border-white/15 transition-colors hover:bg-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* contact */}
            <div className="md:col-span-4">
              <h3 className="mb-3 border-b border-white/10 pb-2 font-display text-base font-bold">
                যোগাযোগ
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-muted">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  বার্তাকক্ষ ও বাণিজ্যিক কার্যালয়: বাড়ি ৩৯১, রোড ২৯, নিউ ডিওএইচএস, মহাখালী, ঢাকা ১২০৬
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  ফোন: ০২-৫৫০০০০০০, ০১৭০০-০০০০০০
                </li>
                <li className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  ইমেইল: news@demo-kalbela.test · ad@demo-kalbela.test
                </li>
              </ul>
            </div>

            {/* other links + epaper */}
            <div className="md:col-span-4">
              <h3 className="mb-3 border-b border-white/10 pb-2 font-display text-base font-bold">
                অন্যান্য
              </h3>
              <ul className="grid grid-cols-2 gap-y-2 text-sm text-ink-muted">
                {extraLinks.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-ink-foreground">
                      {l}
                    </a>
                  </li>
                ))}
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
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-ink-muted md:flex-row">
            <span>© ২০২৬ প্রভাতবাংলা ডেমো। সর্বস্বত্ব সংরক্ষিত।</span>
            <span>
              এটি একটি ডেমো সংবাদমাধ্যম — সব সংবাদ, ছবি ও নাম কেবল উদাহরণ হিসেবে ব্যবহৃত।
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
