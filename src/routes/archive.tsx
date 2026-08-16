import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/my-supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Hash, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

export const Route = createFileRoute('/archive')({
  component: ArchivePage,
  head: () => ({
    meta: [
      { title: "আর্কাইভ — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা সংবাদ আর্কাইভ - সব পুরনো সংবাদ এখন এক জায়গায়।" }
    ]
  })
});

const PAGE_SIZE = 50;

function ArchivePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = async (pageNumber: number) => {
    if (isLoading) return;
    setIsLoading(true);
    
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, slug, category')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching archive:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setPosts(prev => [...prev, ...data]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [inView, hasMore, isLoading]);

  const toBanglaDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      
      <main className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Calendar className="size-8 text-primary" />
              সংবাদ আর্কাইভ
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              প্রভাতবাংলায় প্রকাশিত সব সংবাদ এবং বিশেষ প্রতিবেদনগুলো এখান থেকে দেখে নিতে পারবেন।
            </p>
          </div>

          <div className="p-6">
            {posts.length > 0 ? (
              <div className="grid gap-px bg-slate-100 border border-slate-100">
                {posts.map((post) => (
                  <Link 
                    key={post.id} 
                    to="/post/$slug"
                    params={{ slug: post.slug || post.id }}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 bg-white p-5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 shrink-0 sm:w-48">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-slate-500">
                        {toBanglaDate(post.created_at)}
                      </span>
                    </div>

                    <div className="flex-1 flex items-start gap-3">
                      <ChevronRight className="size-5 mt-0.5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                      <h2 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h2>
                    </div>

                    {post.category && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-bold shrink-0 sm:ml-auto">
                        <Hash className="size-3" />
                        {post.category}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white">
                <div className="bg-slate-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="size-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-1">কোনো সংবাদ পাওয়া যায়নি</h3>
                <p className="text-slate-500">বর্তমানে আর্কাইভে কোনো সংবাদ নেই। অনুগ্রহ করে পরে চেষ্টা করুন।</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
