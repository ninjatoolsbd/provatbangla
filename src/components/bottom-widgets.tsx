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
  const [opinionPage, setOpinionPage] = React.useState(0);
  
  const { data: allOpinionPosts = [] } = useQuery({
    queryKey: ["bottom-opinions"],
    queryFn: () => fetchPublishedPosts(12, "motamot"),
  });

  const opinionPosts = allOpinionPosts.slice(opinionPage * 3, (opinionPage + 1) * 3);
  const totalPages = Math.ceil(allOpinionPosts.length / 3) || 1;


  const { data: latestPosts = [] } = useQuery({
    queryKey: ["bottom-latest"],
    queryFn: () => fetchPublishedPosts(8),
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["bottom-popular"],
    queryFn: () => fetchPublishedPosts(8, undefined, "popular"),
  });

  const tabPosts = activeTab === "latest" ? latestPosts : popularPosts;

  const toBanglaNumber = (n: number) => {
    return String(n).split("").map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join("");
  };

  return (
    <div className="mt-12 grid gap-6 border-t border-border pt-8 lg:grid-cols-3 max-w-7xl mx-auto px-4">
      {/* Column 1: মতামত (Opinion) */}
      <div className="flex flex-col border border-slate-200 rounded-sm bg-white overflow-hidden">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#D0021B] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M12 20h.01M7 20h.01M17 20h.01M12 4v12M7 8l5-4 5 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            মতামত
          </h2>
        </div>
        
        <div className="flex-1 p-3 space-y-4">
          {opinionPosts.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to="/post/$slug"
              params={{ slug: p.slug ?? "" }}
              className="group block bg-[#FFFBEB] rounded-sm overflow-hidden border-b-2 border-[#D0021B] pb-3"
            >
              <div className="p-4 flex gap-4">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#D0021B]">
                    <NewsImage
                      src={p.image_url}
                      alt={p.author_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[12px] font-bold text-slate-800 text-center leading-tight">
                    {p.author_name || "আহমেদ সোহেল বাপ্পী"}
                  </span>
                  <span className="text-[10px] text-slate-500 text-center leading-none">
                    বার্তা সম্পাদক, কালবেলা
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="line-clamp-2 font-display text-[16px] font-bold leading-tight group-hover:text-[#D0021B] transition-colors text-slate-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="line-clamp-3 text-[12px] leading-snug text-slate-600">
                    {p.excerpt || p.content?.replace(/<[^>]*>/g, '').slice(0, 120)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="pb-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setOpinionPage(idx)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  opinionPage === idx ? "bg-slate-800 w-4" : "bg-slate-300 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        )}

      </div>

      {/* Column 2: অনলাইন জরিপ (Online Poll) */}
      <div className="flex flex-col border border-slate-200 rounded-sm bg-white overflow-hidden">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#D0021B] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            অনলাইন জরিপ
          </h2>
        </div>

        <div className="flex-1 p-5 border-t border-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              ০৭ আগস্ট ২০২৪, ০৭:৫৭ পিএম
            </div>
            <button className="text-slate-400 hover:text-[#D0021B]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm mb-5">
            <NewsImage 
              src="https://www.kalbela.com/assets/poll_cover_photos/photo-295.jpg" 
              alt="Poll"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mb-6 font-display text-[17px] font-bold leading-snug text-slate-800">
            সংসদ সদস্যদের সরকারি গাড়ি এবং মন্ত্রীদের মাসিক বেতন ন্যূনতম ১০ লাখ টাকা ও সংসদ সদস্যদের ৫ লাখ টাকা করা উচিত বলে প্রবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান প্রতিমন্ত্রী নুরুল হক নূর যে বক্তব্য দিয়েছেন, সেটির সঙ্গে আপনি কি একমত?
          </p>

          <div className="space-y-2">
            {[
              { label: "হ্যাঁ", value: "yes" },
              { label: "না", value: "no" },
              { label: "মন্তব্য নেই", value: "none" }
            ].map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-3 border border-slate-400 rounded-sm px-4 py-2 transition-all hover:bg-slate-50">
                <input type="radio" name="poll-vote" className="h-4 w-4 rounded-full border-slate-400 text-[#D0021B] focus:ring-[#D0021B]" />
                <span className="text-[15px] font-medium text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="mb-4 text-[13px] font-bold text-slate-500">মোট ভোটদাতা: ৩,২৬৫ জন</p>
            <div className="flex items-center justify-center gap-2">
              {[
                { icon: Facebook, bg: "bg-[#3b5998]" },
                { icon: MessageCircle, bg: "bg-[#0088cc]" },
                { icon: Send, bg: "bg-[#25D366]" },
                { icon: Twitter, bg: "bg-black" },
                { icon: Linkedin, bg: "bg-[#0077b5]" },
                { icon: Share2, bg: "bg-[#075e54]" }
              ].map((social, idx) => (
                <button key={idx} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-sm", social.bg)}>
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Tabs (Latest/Popular) */}
      <div className="flex flex-col border border-slate-200 rounded-sm bg-white overflow-hidden">
        <div className="flex bg-white px-2 pt-2">
          <button 
            onClick={() => setActiveTab("latest")}
            className={cn(
              "flex-1 py-2 text-[17px] font-bold transition-all relative z-10",
              activeTab === "latest" ? "text-slate-900 border-b-2 border-[#D0021B]" : "text-slate-400"
            )}
          >
            সর্বশেষ
          </button>
          <button 
            onClick={() => setActiveTab("popular")}
            className={cn(
              "flex-1 py-2 text-[17px] font-bold transition-all relative z-10",
              activeTab === "popular" ? "text-slate-900 border-b-2 border-[#D0021B]" : "text-slate-400"
            )}
          >
            জনপ্রিয়
          </button>
        </div>

        <div className="flex-1 border-t border-slate-100">
          <div className="space-y-0.5 overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-200">
            {tabPosts.slice(0, 8).map((p, i) => (
              <Link
                key={p.id}
                to="/post/$slug"
                params={{ slug: p.slug ?? "" }}
                className="group flex items-start gap-4 border-b border-slate-100 py-4 px-4 hover:bg-slate-50 transition-colors last:border-0"
              >
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-bold mt-0.5 shadow-sm transition-colors",
                  i < 3 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
                )}>
                  {toBanglaNumber(i + 1)}
                </span>
                <h4 className={cn(
                  "line-clamp-2 font-display text-[15px] font-bold leading-[1.4] transition-colors",
                  i === 3 ? "text-[#D0021B]" : "text-slate-800 group-hover:text-[#D0021B]"
                )}>
                  {p.title}
                </h4>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100">
            <Link 
              to="/category/$slug" 
              params={{ slug: activeTab === "latest" ? "sorboshesh" : "bangladesh" }}
              className="block w-full border border-sky-200 bg-sky-50 py-2.5 text-center text-[15px] font-bold text-sky-800 transition-all hover:bg-sky-100 rounded-sm"
            >
              {activeTab === "latest" ? "সর্বশেষ সব খবর" : "জনপ্রিয় সব খবর"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}