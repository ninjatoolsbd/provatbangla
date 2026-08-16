import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Article } from "@/lib/news-data";
import { NewsImage } from "./news-cards";

interface SidebarSectionProps {
  title: string;
  category: string;
  articles: Article[];
  variant?: 'list' | 'grid' | 'featured-grid' | 'tabs';
}

export function SidebarSection({ title, category, articles, variant = 'list' }: SidebarSectionProps) {
  const [activeTab, setActiveTab] = React.useState<"latest" | "popular">("latest");
  
  if (articles.length === 0 && variant !== 'tabs') return null;

  const toBanglaNumber = (n: number) => {
    return String(n).split("").map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join("");
  };

  return (
    <div className="mb-8 overflow-hidden bg-white last:mb-0">
      {/* Header style matching screenshot: Double black horizontal bars */}
      {variant !== 'featured-grid' && variant !== 'tabs' && (
        <div className="relative mb-4 flex h-[32px] items-center border-y-[3px] border-black bg-white px-0">
          <div className="flex w-full items-center">
            <div className="h-[18px] w-[18px] bg-black" />
            <h3 className="ml-2 font-display text-[18px] font-bold text-black leading-none">
              {title} {category ? `- ${category}` : ''}
            </h3>
            <div className="ml-auto h-[18px] w-2.5 bg-black" />
          </div>
        </div>
      )}
      
      <div>
        {variant === 'list' && (
          <div className="space-y-0">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                to="/news/$id" 
                params={{ id: String(article.id) }}
                className="group flex items-start gap-2 border-b border-dotted border-slate-300 py-3 first:pt-0 last:border-0"
              >
                <ChevronsRight className="mt-0.5 size-[18px] shrink-0 text-black" />
                <span className="font-display text-[16px] leading-[1.3] font-bold text-slate-800 transition-colors group-hover:text-primary">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {variant === 'grid' && (
          <div>
            {articles[0] && (
              <Link 
                to="/news/$id" 
                params={{ id: String(articles[0].id) }}
                className="group mb-5 block"
              >
                <div className="overflow-hidden">
                  <NewsImage 
                    src={articles[0].image} 
                    alt={articles[0].title} 
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="mt-2.5 font-display text-[18px] leading-[1.3] font-bold text-slate-900 group-hover:text-primary">
                  {articles[0].title}
                </h4>
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {articles.slice(1, 5).map((article) => (
                <Link 
                  key={article.id} 
                  to="/news/$id" 
                  params={{ id: String(article.id) }}
                  className="group block"
                >
                  <div className="overflow-hidden">
                    <NewsImage 
                      src={article.image} 
                      alt={article.title} 
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="mt-2 line-clamp-3 font-display text-[14px] leading-tight font-bold text-slate-900 group-hover:text-primary">
                    {article.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {variant === 'featured-grid' && (
          <div>
            <div className="mb-4 rounded-sm bg-[#b20000] py-2 px-3 text-white font-bold text-[18px] text-center shadow-sm">
                {title}
              </div>
            <div className="grid grid-cols-2 gap-2">
              {articles.map((article) => (
                <Link 
                  key={article.id} 
                  to="/news/$id" 
                  params={{ id: String(article.id) }}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-sm shadow-sm"
                >
                  <NewsImage 
                    src={article.image} 
                    alt={article.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2">
                    <h4 className="line-clamp-3 font-display text-[12.5px] leading-tight font-bold text-white group-hover:text-primary">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {variant === 'tabs' && (
          <div className="flex flex-col border border-slate-200 rounded-sm bg-white overflow-hidden">
            <div className="flex bg-slate-50 border-b border-slate-200">
              <button 
                onClick={() => setActiveTab("latest")}
                className={cn(
                  "flex-1 py-3 text-[18px] font-bold transition-all relative border-r border-slate-200",
                  activeTab === "latest" ? "text-[#D0021B] bg-white" : "text-slate-500 bg-slate-50"
                )}
              >
                সর্বশেষ
                {activeTab === "latest" && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#D0021B]"></div>}
              </button>
              <button 
                onClick={() => setActiveTab("popular")}
                className={cn(
                  "flex-1 py-3 text-[18px] font-bold transition-all relative",
                  activeTab === "popular" ? "text-[#D0021B] bg-white" : "text-slate-500 bg-slate-50"
                )}
              >
                জনপ্রিয়
                {activeTab === "popular" && <div className="absolute top-0 left-0 w-full h-[3px] bg-[#D0021B]"></div>}
              </button>
            </div>

            <div className="bg-white">
              {articles.slice(0, 8).map((p, i) => (
                <Link
                  key={p.id}
                  to="/news/$id"
                  params={{ id: String(p.id) }}
                  className="group flex items-center gap-3 border-b border-slate-100 py-3.5 px-4 hover:bg-slate-50 transition-colors last:border-0"
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[14px] font-bold shadow-sm transition-colors",
                    i < 3 ? "bg-[#e8f0fe] text-[#1a73e8]" : "bg-slate-100 text-slate-500"
                  )}>
                    {toBanglaNumber(i + 1)}
                  </span>
                  <h4 className="line-clamp-2 font-display text-[14px] font-bold leading-[1.5] transition-colors group-hover:text-[#D0021B] text-slate-800">
                    {p.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
