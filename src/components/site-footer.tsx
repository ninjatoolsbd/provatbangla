import { Link } from "@tanstack/react-router";

import { categories } from "@/lib/news-data";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <span className="font-display text-3xl font-extrabold">কালবেলা</span>
            <p className="mt-3 text-sm text-ink-muted">
              এটি একটি ডেমো সংবাদমাধ্যম। এখানে প্রকাশিত সব সংবাদ, ছবি ও নাম কেবল উদাহরণ
              হিসেবে ব্যবহৃত হয়েছে।
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">বিভাগ</h3>
            <ul className="space-y-2 text-sm text-ink-muted">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-ink-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">আরও</h3>
            <ul className="space-y-2 text-sm text-ink-muted">
              {categories.slice(6).map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-ink-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">যোগাযোগ</h3>
            <p className="text-sm text-ink-muted">
              বার্তাকক্ষ: ঢাকা, বাংলাদেশ
              <br />
              ইমেইল: news@demo-kalbela.test
              <br />
              ফোন: ০২-৫৫০০০০০০
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-5 text-xs text-ink-muted">
          © ২০২৬ কালবেলা ডেমো। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
