import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Image as ImageIcon, Download, RefreshCw, Search, Edit3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchAllPostsForAdmin } from "@/lib/posts";
import { PhotocardDesigner } from "@/components/photocard-designer";

export const Route = createFileRoute("/admin/photocards")({
  head: () => ({
    meta: [
      { title: "ফটোকোর্ড জেনারেটর — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "নিউজ পোস্ট থেকে ফটোকোর্ড জেনারেট করুন।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PhotocardGeneratorPage,
});

function PhotocardGeneratorPage() {
  const [searchTerm, setSearchTerm] = useState("");
   const [generatingId, setGeneratingId] = useState<string | null>(null);
   const [designingPost, setDesigningPost] = useState<any | null>(null);
  
  const { data: posts, isLoading, refetch } = useQuery({ 
    queryKey: ["admin-posts"], 
    queryFn: fetchAllPostsForAdmin 
  });

  const handleGenerate = async (postId: string) => {
    try {
      setGeneratingId(postId);
      const { generatePostPhotocard } = await import("@/lib/photocard.functions");
      await generatePostPhotocard({ data: { postId } });
      toast.success("ফটোকোর্ড সফলভাবে জেনারেট হয়েছে");
      void refetch();
    } catch (error: any) {
      console.error("Photocard generation failed:", error);
      toast.error("ফটোকোর্ড তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setGeneratingId(null);
    }
  };

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">ফটোকোর্ড জেনারেটর</h1>
          <p className="text-muted-foreground">আপনার নিউজ পোস্টগুলো থেকে সোশ্যাল মিডিয়া ফটোকোর্ড তৈরি করুন।</p>
        </div>
        <Button variant="outline" onClick={() => void refetch()} className="flex items-center gap-2">
          <RefreshCw className="size-4" />
          রিফ্রেশ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="নিউজ শিরোনাম দিয়ে সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              কোনো নিউজ পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-border transition-all hover:border-primary/50">
                  <div className="relative aspect-video bg-muted">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-10 opacity-20" />
                      </div>
                    )}
                    {post.status === 'published' && (
                      <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        Published
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-2 line-clamp-2 min-h-[3rem] font-display text-lg font-bold leading-tight">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between gap-2 border-t pt-4">
                      {(post as any).photocard_url ? (
                        <div className="flex w-full gap-2">
                          <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                          >
                            <a href={(post as any).photocard_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 size-4" />
                              ডাউনলোড
                            </a>
                          </Button>
                           <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDesigningPost(post)}
                            title="ডিজাইন পরিবর্তন করুন"
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleGenerate(post.id)}
                            disabled={generatingId === post.id}
                            title="আবার তৈরি করুন"
                          >
                            {generatingId === post.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <RefreshCw className="size-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleGenerate(post.id)}
                          disabled={generatingId === post.id}
                        >
                          {generatingId === post.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <ImageIcon className="mr-2 size-4" />
                          )}
                           ফটোকোর্ড তৈরি করুন
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDesigningPost(post)}
                        title="নিজে ডিজাইন করুন"
                      >
                        <Edit3 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {designingPost && (
        <PhotocardDesigner
          initialTitle={designingPost.title}
          initialImage={designingPost.image_url}
          postId={designingPost.id}
          onSave={(url) => {
            setDesigningPost(null);
            void refetch();
          }}
          onClose={() => setDesigningPost(null)}
        />
      )}
    </div>
  );
}
