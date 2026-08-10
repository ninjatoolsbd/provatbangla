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
    <div className="mt-12 grid gap-6 border-t border-border pt-8 lg:grid-cols-3 max-w-7xl mx-auto px-4">
      {/* Column 1: মতামত (Opinion) */}
      <div className="flex flex-col bg-white">
        <div className="mb-4 flex items-center justify-between border-b-[3px] border-slate-100 pb-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#D0021B] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M12 20h.01M7 20h.01M17 20h.01M12 4v12M7 8l5-4 5 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            মতামত
          </h2>
          <Link to="/category/$slug" params={{ slug: "motamot" }} className="text-sm font-bold text-slate-500 hover:text-[#D0021B]">
            সব খবর →
          </Link>
        </div>
        
        <div className="flex-1 space-y-px">
          {opinionPosts.map((p) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group flex gap-4 bg-[#FFFDE7] p-4 transition-colors hover:bg-[#FFF9C4] border-b border-white last:border-0"
            >
              <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full border-2 border-[#D0021B] shadow-sm">
                <NewsImage
                  src={p.image_url}
                  alt={p.author_name}
                  className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-[9px] text-white text-center font-bold">সম্পাদকীয়</div>
              </div>
              <div className="flex-1">
                <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-tight group-hover:text-[#D0021B] transition-colors text-slate-800">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-slate-500">
                  {p.excerpt || p.content?.replace(/<[^>]*>/g, '').slice(0, 100)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="mt-4 flex justify-center gap-2 py-2">
          <button className="h-2 w-2 rounded-full bg-slate-800" aria-label="Page 1" />
          <button className="h-2 w-2 rounded-full bg-slate-300 hover:bg-slate-400" aria-label="Page 2" />
          <button className="h-2 w-2 rounded-full bg-slate-300 hover:bg-slate-400" aria-label="Page 3" />
        </div>
      </div>

      {/* Column 2: অনলাইন জরিপ (Online Poll) */}
      <div className="flex flex-col bg-white">
        <div className="mb-4 flex items-center justify-between border-b-[3px] border-slate-100 pb-2">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#D0021B] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            অনলাইন জরিপ
          </h2>
        </div>

        <div className="flex-1 border border-slate-100 bg-white p-5 shadow-sm rounded-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {banglaDateTime(new Date().toISOString())}
            </div>
            <button className="text-slate-300 hover:text-[#D0021B] transition-colors" title="Download Results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-slate-50 border border-slate-100 mb-6">
            <img 
              src="https://www.kalbela.com/assets/images/poll-default.jpg" 
              alt="Poll Header"
              className="h-full w-full object-cover opacity-90"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f8fafc/94a3b8?text=Poll';
              }}
            />
          </div>

          <p className="my-5 font-display text-[18px] font-bold leading-[1.4] text-slate-800 tracking-tight">
            সংসদ সদস্যদের সরকারি গাড়ি এবং মন্ত্রীদের মাসিক বেতন ন্যূনতম ১০ লাখ টাকা ও সংসদ সদস্যদের ৫ লাখ টাকা করা উচিত বলে প্রবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান প্রতিমন্ত্রী নুরুল হক নূর যে বক্তব্য দিয়েছেন, সেটির সঙ্গে আপনি কি একমত?
          </p>

          <div className="space-y-2.5 mt-6">
            {[
              { label: "হ্যাঁ", value: "yes" },
              { label: "না", value: "no" },
              { label: "মন্তব্য নেই", value: "none" }
            ].map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-3 border border-slate-200 px-5 py-2.5 transition-all hover:border-slate-300 hover:bg-slate-50 rounded-sm">
                <input type="radio" name="poll-vote" className="h-4.5 w-4.5 border-slate-300 text-[#D0021B] focus:ring-[#D0021B]/20" />
                <span className="text-[16px] font-medium text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="mb-5 text-[14px] font-bold text-slate-500 bg-slate-50 py-1.5 rounded-full inline-block px-6">মোট ভোটদাতা: ২,৩১৯ জন</p>
            <div className="flex items-center justify-center gap-3">
              {[
                { icon: Facebook, bg: "bg-[#3b5998]" },
                { icon: Send, bg: "bg-[#0088cc]" },
                { icon: MessageCircle, bg: "bg-[#25D366]" },
                { icon: Twitter, bg: "bg-black" },
                { icon: Linkedin, bg: "bg-[#0077b5]" },
                { icon: Share2, bg: "bg-[#075e54]" }
              ].map((social, idx) => (
                <button key={idx} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-sm", social.bg)}>
                  <social.icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Tabs (Latest/Popular) */}
      <div className="flex flex-col bg-white">
        <div className="mb-4 flex border-b-[3px] border-slate-100">
          <button 
            onClick={() => setActiveTab("latest")}
            className={cn(
              "flex-1 pb-2 text-[19px] font-bold transition-all relative",
              activeTab === "latest" ? "text-slate-900 after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:right-0 after:h-[3px] after:bg-[#D0021B]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            সর্বশেষ
          </button>
          <button 
            onClick={() => setActiveTab("popular")}
            className={cn(
              "flex-1 pb-2 text-[19px] font-bold transition-all relative",
              activeTab === "popular" ? "text-slate-900 after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:right-0 after:h-[3px] after:bg-[#D0021B]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            জনপ্রিয়
          </button>
        </div>

        <div className="flex-1 border-x border-slate-50">
          <div className="space-y-0.5 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
            {tabPosts.slice(0, 10).map((p, i) => (
              <Link
                key={p.id}
                to="/post/$slug"
                params={{ slug: p.slug ?? "" }}
                className="group flex items-start gap-4 border-b border-slate-100 py-4 px-4 hover:bg-slate-50 transition-colors"
              >
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-bold mt-0.5 shadow-sm transition-colors",
                  i < 3 ? "bg-slate-200 text-slate-700 group-hover:bg-[#D0021B] group-hover:text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {toBanglaNumber(i + 1)}
                </span>
                <h4 className="line-clamp-3 font-display text-[17px] font-bold leading-[1.35] text-slate-800 group-hover:text-[#D0021B] transition-colors">
                  {p.title}
                </h4>
              </Link>
            ))}
          </div>

          <Link 
            to="/category/$slug" 
            params={{ slug: activeTab === "latest" ? "sorboshesh" : "bangladesh" }}
            className="mt-6 block w-full border border-slate-200 bg-[#D0021B] py-3.5 text-center text-[16px] font-bold text-white transition-all hover:bg-[#B00218] shadow-md mx-auto rounded-sm uppercase tracking-wide"
          >
            {activeTab === "latest" ? "সর্বশেষ সব খবর" : "জনপ্রিয় সব খবর"}
          </Link>
        </div>
      </div>
    </div>
  );
}