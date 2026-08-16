import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/my-supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Link } from "@tanstack/react-router";
import { BookOpen, Calendar, Clock, ChevronRight, Hash } from "lucide-react";
import { NewsImage } from "@/components/news-image";

export const Route = createFileRoute('/magazine')({
  component: MagazinePage,
  loader: async () => {
    // We'll treat a specific category as magazine or just filter posts with a magazine tag/category
    // For now, let's fetch latest published posts as demo content for the magazine
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, created_at, slug, category, image_url, excerpt')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12);
    
    return { posts: posts || [] };
  },
  head: () => ({
    meta: [
      { title: "ম্যাগাজিন — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা ম্যাগাজিন - সাহিত্য, সংস্কৃতি এবং বিশেষ প্রতিবেদন।" }
    ]
  })
});

function MagazinePage() {
  const { posts } = Route.useLoaderData();
  
  const toBanglaDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <SiteHeader />
      
      {/* Magazine Hero Section */}
      <div className="bg-slate-900 text-white py-16 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] pointer-events-none"></div>
        <main className="mx-auto max-w-[1360px] px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 mb-6 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-700">
            <BookOpen className="size-4" />
            বিশেষ সাহিত্য ও সংস্কৃতি সংখ্যা
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 tracking-tight">
            প্রভাতবাংলা <span className="text-primary">ম্যাগাজিন</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            গল্প, কবিতা, প্রবন্ধ এবং বিশেষ সংবাদ ভাষ্যের এক অনন্য সমাহার। ঐতিহ্যের সঙ্গে আধুনিকতার মেলবন্ধন।
          </p>
        </main>
      </div>

      <main className="mx-auto max-w-[1360px] px-4 pb-20">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {posts.map((post, index) => (
              <Link 
                key={post.id} 
                to="/post/$slug"
                params={{ slug: post.slug || post.id }}
                className={`group flex flex-col bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 rounded-lg overflow-hidden ${index === 0 ? 'md:col-span-2 lg:col-span-2 md:flex-row' : ''}`}
              >
                <div className={`relative overflow-hidden ${index === 0 ? 'md:w-3/5 shrink-0' : 'aspect-[16/9]'}`}>
                  <NewsImage 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-[12px] font-bold px-3 py-1 rounded shadow-lg uppercase tracking-wider">
                      {post.category || 'ফিচার'}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-4 text-slate-500 text-[13px] font-medium mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {toBanglaDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        ৫ মিনিট পাঠ
                      </span>
                    </div>
                    
                    <h2 className={`font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-4 ${index === 0 ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'}`}>
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-600 line-clamp-3 text-[15px] leading-relaxed mb-6">
                      {post.excerpt || 'এই বিশেষ প্রতিবেদনটির বিস্তারিত খবর পড়তে ক্লিক করুন। প্রভাতবাংলা ম্যাগাজিনে নিয়মিতভাবে আমরা সমসাময়িক বিষয় নিয়ে গভীর বিশ্লেষণধর্মী লেখা প্রকাশ করে থাকি।'}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-primary font-bold text-sm gap-1 group-hover:translate-x-2 transition-transform duration-300">
                    পুরোটা পড়ুন
                    <ChevronRight className="size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 size-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="size-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">ম্যাগাজিনে কোনো লেখা নেই</h3>
            <p className="text-slate-500">অনুগ্রহ করে পরে আবার ভিজিট করুন।</p>
          </div>
        )}
        
        {/* Newsletter Signup in Magazine Style */}
        <div className="mt-20 bg-primary/5 rounded-3xl p-8 md:p-16 border border-primary/10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">ম্যাগাজিনের নতুন সংখ্যা পেতে চান?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            আপনার ইমেইল ঠিকানা দিয়ে সাবস্ক্রাইব করুন। নতুন লেখা প্রকাশের সাথে সাথেই আপনাকে জানিয়ে দেওয়া হবে।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="আপনার ইমেইল লিখুন" 
              className="flex-1 px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800"
            />
            <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-primary/20">
              সাবস্ক্রাইব
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
