import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, MessageCircle, Send, Twitter, Linkedin, Share2, ChevronRight, ChevronLeft } from "lucide-react";
import { NewsImage } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";
import { fetchPublishedPosts, banglaDateTime } from "@/lib/posts";
import { cn } from "@/lib/utils";

/**
 * BottomWidgets replica based on user-uploads://file-16
 * Contains: Opinions (মতামত), Online Poll (অনলাইন জরিপ), and Popular Tabs (সর্বশেষ/জনপ্রিয়)
 */
export function BottomWidgets() {
  const [activeTab, setActiveTab] = React.useState<"latest" | "popular">("latest");
  
  const { data: opinionPosts = [] } = useQuery({
    queryKey: ["bottom-opinions"],
    queryFn: () => fetchPublishedPosts(4, "motamot"),
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["bottom-latest"],
    queryFn: () => fetchPublishedPosts(8),
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["bottom-popular"],
    queryFn: () => fetchPublishedPosts(8), // In a real app, this would be filtered by views
  });

  const tabPosts = activeTab === "latest" ? latestPosts : popularPosts;

  const toBanglaNumber = (n: number) => {
    return String(n).split("").map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join("");
  };

  return (
    <div className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-3">
      {/* Column 1: মতামত (Opinion) */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="h-5 w-1.5 bg-primary" />
            মতামত
          </h2>
          <Link to="/category/$slug" params={{ slug: "motamot" }} className="text-xs font-bold text-muted-foreground hover:text-primary">
            সব খবর →
          </Link>
        </div>
        
        <div className="flex-1 space-y-1">
          {opinionPosts.map((p) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group flex gap-4 bg-[#FFFDF0] p-4 transition-colors hover:bg-[#FFF9D6]"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-primary/10 shadow-sm">
                <NewsImage
                  src={p.image_url}
                  alt={p.author_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <span className="block text-[13px] font-bold text-primary mb-0.5">{p.author_name || "প্রভাতবাংলা ডেস্ক"}</span>
                <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* Column 2: অনলাইন জরিপ (Online Poll) */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="h-5 w-1.5 bg-primary" />
            অনলাইন জরিপ
          </h2>
        </div>

        <div className="flex-1 border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full border border-muted-foreground/30" />
              {banglaDateTime(new Date().toISOString())}
            </div>
            <button className="text-muted-foreground hover:text-primary">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
            <NewsImage 
              src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80" 
              alt="Poll"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="my-4 font-display text-[16px] font-bold leading-tight">
            নির্বাচন ব্যবস্থার সংস্কার নিয়ে রাজনৈতিক দলগুলোর মধ্যে যে আলোচনার প্রস্তাব দেওয়া হয়েছে, আপনি কি তা সমর্থন করেন?
          </p>

          <div className="space-y-2">
            {["হ্যাঁ", "না", "মন্তব্য নেই"].map((label) => (
              <label key={label} className="flex cursor-pointer items-center gap-3 border border-border px-4 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/5">
                <input type="radio" name="poll-vote" className="h-4 w-4 accent-primary" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-5 text-center">
            <p className="mb-3 text-[11px] font-bold text-muted-foreground">মোট ভোটদাতা: ২,৩১৯ জন</p>
            <div className="flex justify-center gap-2">
              {[
                { icon: Facebook, bg: "bg-[#3b5998]" },
                { icon: Send, bg: "bg-[#0088cc]" },
                { icon: MessageCircle, bg: "bg-[#25D366]" },
                { icon: Twitter, bg: "bg-black" },
                { icon: Linkedin, bg: "bg-[#0077b5]" }
              ].map((social, idx) => (
                <button key={idx} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110", social.bg)}>
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: সর্বশেষ / জনপ্রিয় Tabs */}
      <div className="flex flex-col">
        <div className="mb-4 flex border-b border-border">
          <button 
            onClick={() => setActiveTab("latest")}
            className={cn(
              "flex-1 pb-2 text-[17px] font-bold transition-all",
              activeTab === "latest" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            সর্বশেষ
          </button>
          <button 
            onClick={() => setActiveTab("popular")}
            className={cn(
              "flex-1 pb-2 text-[17px] font-bold transition-all",
              activeTab === "popular" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            জনপ্রিয়
          </button>
        </div>

        <div className="flex-1 space-y-1">
          {tabPosts.slice(0, 8).map((p, i) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group flex items-start gap-4 border-b border-border/50 py-3 last:border-0"
            >
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition-colors",
                i < 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}>
                {toBanglaNumber(i + 1)}
              </span>
              <h4 className="line-clamp-2 font-display text-[15px] font-bold leading-snug group-hover:text-primary transition-colors">
                {p.title}
              </h4>
            </Link>
          ))}
        </div>

        <Link 
          to="/category/$slug" 
          params={{ slug: activeTab === "latest" ? "sorboshesh" : "bangladesh" }}
          className="mt-6 block w-full border border-[#D9EBFF] bg-[#F2F8FF] py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-[#E1F0FF]"
        >
          {activeTab === "latest" ? "সর্বশেষ সব খবর" : "জনপ্রিয় সব খবর"}
        </Link>
      </div>
    </div>
  );
}