import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/my-supabase/client";

export const Route = createFileRoute('/archive')({
  component: ArchivePage,
  loader: async () => {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, created_at, slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    return { posts: posts || [] };
  }
});

function ArchivePage() {
  const { posts } = Route.useLoaderData();
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-[1000px]">
      <h1 className="text-3xl font-bold mb-8 border-b-4 border-primary pb-4">আর্কাইভ</h1>
      
      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-4 border-b border-border pb-4 hover:bg-slate-50 p-2 transition-colors">
            <span className="text-sm text-muted-foreground w-32 shrink-0 font-medium">
              {new Date(post.created_at).toLocaleDateString('bn-BD')}
            </span>
            <a href={`/post/${post.slug}`} className="text-lg font-bold text-slate-800 hover:text-primary transition-colors">
              {post.title}
            </a>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center py-12 text-muted-foreground">কোনো নিউজ পাওয়া যায়নি।</p>}
      </div>
    </div>
  );
}
