import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/my-supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Link } from "@tanstack/react-router";
import { BookOpen, Calendar, Clock, ChevronRight, Hash, ChevronLeft } from "lucide-react";
import { NewsImage } from "@/components/news-cards";
import HTMLFlipBook from 'react-pageflip';
import { useState, useRef, forwardRef } from 'react';
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute('/magazine')({
  component: MagazinePage,
  loader: async () => {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, created_at, slug, category, image_url, excerpt')
      .eq('status', 'published')
      .ilike('category', '%বিনোদন%')
      .order('created_at', { ascending: false })
      .limit(20);
    
    return { posts: posts || [] };
  },
  head: () => ({
    meta: [
      { title: "ম্যাগাজিন — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা ম্যাগাজিন - বইয়ের মতো উল্টে পড়ার এক অনন্য অভিজ্ঞতা।" }
    ]
  })
});

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>((props, ref) => {
  return (
    <div className="bg-[#fdfcf8] shadow-2xl border-x border-slate-200" ref={ref}>
      <div className="h-full flex flex-col p-6 sm:p-10 relative">
        <div className="flex-1 flex flex-col">
          {props.children}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>প্রভাতবাংলা ম্যাগাজিন</span>
          <span>পৃষ্ঠা {props.number}</span>
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

function MagazinePage() {
  const { posts } = Route.useLoaderData();
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const toBanglaDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-[1200px] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold font-display text-slate-900">ম্যাগাজিন এডিশন</h1>
            <p className="text-slate-500 font-medium italic">ভার্চুয়াল ম্যাগাজিন - উল্টে পড়তে থাকুন</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => bookRef.current.pageFlip().flipPrev()}
              className="size-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-slate-200"
            >
              <ChevronLeft className="size-6" />
            </button>
            <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              পেজ {currentPage + 1} / {posts.length + 2}
            </span>
            <button 
              onClick={() => bookRef.current.pageFlip().flipNext()}
              className="size-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-slate-200"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        <div className="relative w-full flex justify-center py-4 sm:py-10">
          {/* @ts-ignore */}
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={315}
            maxWidth={1000}
            minHeight={420}
            maxHeight={1333}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            className="shadow-2xl mx-auto"
            ref={bookRef}
          >
            {/* Cover Page */}
            <div className="bg-slate-900 text-white shadow-2xl overflow-hidden relative" ref={null as any}>
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border-8 border-primary/30 relative z-10">
                <img src={logoAsset.url} alt="Logo" className="w-48 mb-12 brightness-0 invert" />
                <div className="w-16 h-1 bg-primary mb-6"></div>
                <h2 className="text-5xl font-bold font-display mb-4 tracking-tighter">ম্যাগাজিন</h2>
                <p className="text-xl text-primary font-bold uppercase tracking-[0.2em] mb-12">বিশেষ সংখ্যা</p>
                <div className="mt-auto text-slate-400 font-bold uppercase tracking-widest text-sm">
                  আগস্ট ২০২৬
                </div>
              </div>
            </div>

            {/* Articles Pages */}
            {posts.map((post, i) => (
              <Page key={post.id} number={i + 1}>
                <div className="flex-1 flex flex-col">
                  <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded shadow-sm">
                    <NewsImage 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-3 uppercase tracking-wider">
                    <Hash className="size-3" />
                    {post.category}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight font-display">
                    {post.title}
                  </h2>
                  
                  <div className="text-slate-600 text-sm leading-[1.8] mb-6 line-clamp-[12] whitespace-pre-wrap">
                    {post.excerpt || 'এই বিশেষ প্রতিবেদনটির বিস্তারিত খবর প্রভাতবাংলা ম্যাগাজিনে নিয়মিতভাবে আমরা সমসাময়িক বিষয় নিয়ে গভীর বিশ্লেষণধর্মী লেখা প্রকাশ করে থাকি। এ বিষয়ে সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে পরিস্থিতি নিয়মিত পর্যবেক্ষণে রাখা হয়েছে।'}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-[12px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {toBanglaDate(post.created_at)}
                    </span>
                    <Link 
                      to="/post/$slug" 
                      params={{ slug: post.slug || post.id }}
                      className="text-primary font-bold hover:underline"
                    >
                      মূল প্রতিবেদন
                    </Link>
                  </div>
                </div>
              </Page>
            ))}

            {/* Back Cover */}
            <div className="bg-slate-900 text-white shadow-2xl relative" ref={null as any}>
              <div className="h-full flex flex-col items-center justify-center p-12 text-center relative z-10">
                <img src={logoAsset.url} alt="Logo" className="w-32 mb-8 opacity-30 grayscale" />
                <p className="text-slate-500 text-sm italic">ধন্যবাদ আমাদের সাথে থাকার জন্য</p>
                <div className="mt-20 flex gap-4">
                  <div className="size-8 rounded bg-white/10"></div>
                  <div className="size-8 rounded bg-white/10"></div>
                  <div className="size-8 rounded bg-white/10"></div>
                </div>
              </div>
            </div>
          </HTMLFlipBook>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

