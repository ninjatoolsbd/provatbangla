import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Globe, Languages, Zap } from "lucide-react";

export const Route = createFileRoute('/english')({
  component: EnglishRedirectPage,
  head: () => ({
    meta: [
      { title: "English News — Provat Bangla" },
      { name: "description", content: "Latest news from Bangladesh and around the world in English." }
    ]
  })
});

function EnglishRedirectPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-primary/10 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="size-10 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            English Version Coming Soon
          </h1>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            We are working hard to bring you the Provat Bangla experience in English. 
            Stay tuned for international standard reporting, now for a global audience.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-lg">
              <Languages className="size-4 text-primary" />
              <span>Real-time AI Translation active soon</span>
            </div>
            
            <a 
              href="/"
              className="block w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Bengali Version
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            <Zap className="size-3 fill-current" />
            Provat Bangla Global
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
