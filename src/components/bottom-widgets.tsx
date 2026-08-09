import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, MessageCircle, Send, Twitter, Linkedin, Share2 } from "lucide-react";
import { NewsImage } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";
import { fetchPublishedPosts, banglaDateTime } from "@/lib/posts";
import { categoryName } from "@/lib/news-data";
import { cn } from "@/lib/utils";

/**
 * BottomWidgets replica based on user-uploads://file-16
 * Contains: Opinions (মতামত), Online Poll (অনলাইন জরিপ), and Popular Tabs (সর্বশেষ/জনপ্রিয়)
 */
export function BottomWidgets() {
  const { data: opinionPosts = [] } = useQuery({
    queryKey: ["bottom-opinions"],
    queryFn: () => fetchPublishedPosts(3, "motamot"),
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["bottom-latest"],
    queryFn: () => fetchPublishedPosts(10),
  });

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* Column 1: মতামত (Opinion) */}
      <div className="space-y-4">
        <BarHeading title="মতামত" slug="motamot" />
        <div className="space-y-4">
          {opinionPosts.map((p) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group flex gap-4 border-b border-border/50 bg-[#FFFBEB] p-4 transition-colors hover:bg-[#FEF3C7]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                <NewsImage
                  src={p.image_url}
                  alt={p.author_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-display text-base font-bold leading-snug group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
              </div>
            </Link>
          ))}
          {/* Pagination dots replica */}
          <div className="flex justify-center gap-1.5 pt-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          </div>
        </div>
      </div>

      {/* Column 2: অনলাইন জরিপ (Online Poll) */}
      <div className="space-y-4">
        <BarHeading title="অনলাইন জরিপ" />
        <div className="border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
             <span className="flex items-center gap-1">
               <span className="inline-block h-3 w-3 rounded-full border border-muted-foreground/30" />
               {banglaDateTime(new Date().toISOString())}
             </span>
             <Share2 className="h-4 w-4 cursor-pointer hover:text-primary" />
          </div>
          
          <div className="mt-3 overflow-hidden rounded-sm">
             <NewsImage 
                src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80" 
                alt="Poll context"
                className="aspect-[16/9] w-full object-cover"
             />
          </div>

          <p className="mt-4 font-display text-[15px] font-bold leading-snug">
            দেশের বর্তমান রাজনৈতিক পরিস্থিতিতে নির্বাচন কমিশন যে রোডম্যাপ ঘোষণা করেছে, সেটির সঙ্গে আপনি কি একমত?
          </p>

          <div className="mt-4 space-y-2">
            {["হ্যাঁ", "না", "মন্তব্য নেই"].map((opt) => (
              <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-sm border border-border p-2.5 transition-colors hover:border-primary/50">
                <input type="radio" name="poll" className="h-4 w-4 accent-primary" />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
             <div className="text-xs font-bold text-muted-foreground">
               মোট ভোটদাতা: ২,৩১৯ জন
             </div>
             <div className="flex gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b5998] text-white hover:opacity-90">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0088cc] text-white hover:opacity-90">
                  <Send className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:opacity-90">
                  <Twitter className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077b5] text-white hover:opacity-90">
                  <Linkedin className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Column 3: সর্বশেষ / জনপ্রিয় Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-border">
          <button className="border-b-2 border-primary px-4 py-2 text-sm font-bold text-primary">সর্বশেষ</button>
          <button className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">জনপ্রিয়</button>
        </div>
        
        <div className="space-y-1">
          {latestPosts.slice(0, 8).map((p, i) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group flex items-start gap-3 border-b border-border/50 py-2.5 last:border-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/30 font-display text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                {String(i + 1).split("").map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join("")}
              </span>
              <h4 className="line-clamp-2 font-display text-[14px] font-bold leading-snug group-hover:text-primary">
                {p.title}
              </h4>
            </Link>
          ))}
        </div>

        <Link 
          to="/category/$slug" 
          params={{ slug: "sorboshesh" }}
          className="mt-4 block w-full rounded-sm border border-[#E5F3FF] bg-[#F4F9FF] py-2.5 text-center text-sm font-bold text-primary hover:bg-[#E5F3FF]"
        >
          সর্বশেষ সব খবর
        </Link>
      </div>
    </div>
  );
}
