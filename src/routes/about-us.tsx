import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/about-us')({
  head: () => ({
    meta: [
      { title: 'আমাদের সম্পর্কে | প্রভাতবাংলা' },
      { name: 'description', content: 'প্রভাতবাংলা সম্পর্কে বিস্তারিত জানুন।' },
    ],
  }),
  component: AboutUsPage,
});

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1360px] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-display text-4xl font-bold text-primary border-b-4 border-primary/20 pb-4">
            আমাদের সম্পর্কে
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-6 font-body leading-relaxed">
            <p className="text-xl font-medium text-muted-foreground">
              প্রভাতবাংলা — একটি সত্য ও নির্ভরযোগ্য সংবাদ পরিবেশনকারী ডিজিটাল সংবাদ মাধ্যম।
            </p>
            
            <p>
              আমরা বস্তুনিষ্ঠ সংবাদ এবং গভীর বিশ্লেষণের মাধ্যমে পাঠককে সমাজের প্রতিটি স্তরের সাথে সংযুক্ত করতে অঙ্গীকারবদ্ধ। আমাদের লক্ষ্য হলো স্বচ্ছতা এবং সাহসিকতার সাথে সংবাদ পরিবেশন করা।
            </p>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">আমাদের লক্ষ্য</h2>
            <p>
              প্রভাতবাংলা কেবল সংবাদ দেয় না, বরং সংবাদের পেছনের গল্পটি তুলে ধরে। আমরা জাতীয়, আন্তর্জাতিক, রাজনীতি, অর্থনীতি, খেলাধুলা, এবং বিনোদনসহ সব ধরনের সংবাদের একটি সমন্বিত প্ল্যাটফর্ম হিসেবে কাজ করি।
            </p>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">আমাদের সম্পাদকীয় নীতি</h2>
            <p>
              সত্যনিষ্ঠা, নিরপেক্ষতা এবং সাংবাদিকতার নৈতিকতা আমাদের প্রধান মূলধন। আমরা কোনো রাজনৈতিক বা বাণিজ্যিক গোষ্ঠীর দ্বারা প্রভাবিত না হয়ে জনমানুষের কণ্ঠস্বর হতে চাই।
            </p>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">যোগাযোগ</h2>
            <p>
              আপনার যেকোনো মতামত, অভিযোগ বা খবরের জন্য আমাদের সাথে যোগাযোগ করতে পারেন:
              <br />
              ইমেইল: info@provatbanglanews.com
              <br />
              ফোন: ০১৭০০-০০০০০০
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
