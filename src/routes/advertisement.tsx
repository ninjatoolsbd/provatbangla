import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/advertisement')({
  head: () => ({
    meta: [
      { title: 'বিজ্ঞাপন | প্রভাতবাংলা' },
      { name: 'description', content: 'প্রভাতবাংলায় বিজ্ঞাপন দেওয়ার নিয়মাবলি ও বিস্তারিত তথ্য।' },
    ],
  }),
  component: AdvertisementPage,
});

function AdvertisementPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1360px] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-display text-4xl font-bold text-primary border-b-4 border-primary/20 pb-4">
            বিজ্ঞাপন
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-6 font-body leading-relaxed">
            <p className="text-xl font-medium text-muted-foreground">
              প্রভাতবাংলা—এ বিজ্ঞাপন দিয়ে আপনার ব্যবসা বা সেবাকে পৌঁছে দিন লাখো পাঠকের কাছে।
            </p>
            
            <p>
              প্রভাতবাংলা বাংলাদেশের অন্যতম দ্রুত বর্ধনশীল ডিজিটাল নিউজ পোর্টাল। আমাদের বৈচিত্র্যময় পাঠকশ্রেণি এবং বিশাল নেটওয়ার্ক আপনার ব্র্যান্ডের প্রচারণার জন্য একটি আদর্শ প্ল্যাটফর্ম। 
            </p>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">বিজ্ঞাপনের ধরন</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>ব্যানার বিজ্ঞাপন (হোমপেজ ও ক্যাটাগরি পেজ)</li>
              <li>আর্টিকেল বা সংবাদ ভিত্তিক বিজ্ঞাপন (Sponsored Content)</li>
              <li>ভিডিও বিজ্ঞাপন</li>
              <li>সোশ্যাল মিডিয়া প্রমোশন</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">কেন আমাদের সাথে বিজ্ঞাপন দেবেন?</h2>
            <p>
              আমাদের পাঠকরা মূলত শিক্ষিত, সচেতন এবং সিদ্ধান্ত গ্রহণকারী তরুণ ও পেশাদার। আপনার টার্গেট অডিয়েন্সের কাছে পৌঁছাতে আমরা অত্যাধুনিক ডিজিটাল মার্কেটিং টুলস এবং ডেটা অ্যানালিটিক্স ব্যবহার করি।
            </p>
            
            <h2 className="text-2xl font-bold mt-10 text-foreground">বিজ্ঞাপনের জন্য যোগাযোগ করুন</h2>
            <div className="bg-accent/10 p-6 rounded-lg border border-primary/20">
              <p className="font-bold text-primary mb-2">বিজ্ঞাপন বিভাগ:</p>
              <p>ইমেইল: ads@provatbanglanews.com</p>
              <p>ফোন: +৮৮ ০১৭০০-০০০০০০</p>
              <p>হোয়াটসঅ্যাপ: +৮৮ ০১৭০০-০০০০০০</p>
            </div>
            
            <p className="text-sm text-muted-foreground mt-8 italic">
              দ্রষ্টব্য: প্রভাতবাংলা তার সম্পাদকীয় নীতির সাথে সাংঘর্ষিক কোনো বিজ্ঞাপন প্রচার করে না।
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
