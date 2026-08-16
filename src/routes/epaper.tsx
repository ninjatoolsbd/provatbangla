import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/my-supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsImage } from "@/components/news-cards";
import { Calendar, Eye, Download, Share2, Newspaper } from "lucide-react";
import { useState } from 'react';

export const Route = createFileRoute('/epaper')({
  component: EPaperPage,
  loader: async () => {
    // In a real app, you might have a dedicated 'epaper' table
    // For now, let's fetch recent posts from a specific 'epaper' category if it exists,
    // or just show a beautiful placeholder layout for the e-paper experience.
    const { data: issues } = await supabase
      .from('posts')
      .select('id, title, created_at, image_url')
      .eq('status', 'published')
      .ilike('category', '%epaper%')
      .order('created_at', { ascending: false })
      .limit(6);
      
    return { issues: issues || [] };
  },
  head: () => ({
    meta: [
      { title: "ই-পেপার — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা ই-পেপার - আজকের সংবাদপত্র অনলাইনে পড়ুন।" }
    ]
  })
});

function EPaperPage() {
  const { issues } = Route.useLoaderData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const toBanglaDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-4xl font-bold font-display text-slate-900 mb-2">ই-পেপার</h1>
              <p className="text-slate-500 font-medium">প্রভাতবাংলা ডিজিটাল সংস্করণ - সংবাদপত্র এখন আপনার হাতের মুঠোয়</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-sm font-bold text-slate-600 whitespace-nowrap">পুরানো সংখ্যা দেখুন:</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {issues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {issues.map((issue) => (
                <div key={issue.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <NewsImage 
                      src={issue.image_url} 
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="size-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors">
                        <Eye className="size-6" />
                      </button>
                      <button className="size-12 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors">
                        <Download className="size-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Calendar className="size-3" />
                      {toBanglaDate(issue.created_at)}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                      {issue.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 p-20 text-center">
              <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                < Newspaper className="size-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">আজকের ই-পেপার পাওয়া যায়নি</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">দুঃখিত, বর্তমানে ই-পেপারের কোনো সংখ্যা আপলোড করা নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors">
                আর্কাইভ দেখুন
              </button>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
