import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Cookie, UserX, Server } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তা নীতি — প্রভাতবাংলা" },
      {
        name: "description",
        content: "প্রভাতবাংলা নিউজ পোর্টালের গোপনীয়তা নীতি। আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সংরক্ষণ করি তা জানুন।",
      },
      { property: "og:title", content: "গোপনীয়তা নীতি — প্রভাতবাংলা" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const sections = [
    {
      title: "১. আমাদের প্রতিশ্রুতি",
      icon: Shield,
      content:
        "প্রভাতবাংলা (provatbanglanews.com) আপনার গোপনীয়তাকে গুরুত্ব দেয়। এই নীতিতে আমরা আমাদের ওয়েবসাইট ব্যবহারের সময় আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং রক্ষা করি তা ব্যাখ্যা করেছি।",
    },
    {
      title: "২. আমরা কী তথ্য সংগ্রহ করি",
      icon: Eye,
      content:
        "আমরা সরাসরি আপনার কাছ থেকে প্রদত্ত তথ্য (যেমন: নাম, ইমেইল, মন্তব্য) এবং স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য (যেমন: আইপি ঠিকানা, ব্রাউজারের ধরন, ডিভাইসের তথ্য, ভিজিটের সময় ও তারিখ) সংগ্রহ করতে পারি। এই তথ্য আমাদের সাইটের অভিজ্ঞতা উন্নত করতে সহায়ক।",
    },
    {
      title: "৩. তথ্যের ব্যবহার",
      icon: Lock,
      content:
        "সংগৃহীত তথ্য আমরা সাইটের কার্যকারিতা উন্নত করতে, ব্যবহারকারীদের প্রশ্নের উত্তর দিতে, মন্তব্য মডারেট করতে, নিরাপত্তা নিশ্চিত করতে এবং আইনি বাধ্যবাধকতা পালনের জন্য ব্যবহার করি। আমরা কখনোই আপনার ব্যক্তিগত তথ্য বিক্রি বা ভাড়া দিই না।",
    },
    {
      title: "৪. কুকিজ এবং ট্র্যাকিং",
      icon: Cookie,
      content:
        "আমাদের ওয়েবসাইটে কিছু কুকিজ এবং তৃতীয় পক্ষের ট্র্যাকিং প্রযুক্তি ব্যবহার হতে পারে, যেমন Google Analytics এবং Google Translate widget। এগুলো আপনার ব্রাউজিং অভিজ্ঞতা এবং ভাষার পছন্দ মনে রাখতে সাহায্য করে। আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন।",
    },
    {
      title: "৫. তথ্য ভাগাভাগি",
      icon: Server,
      content:
        "আমরা কেবলমাত্র আইনি প্রয়োজনে বা পরিষেবা প্রদানকারীদের (যেমন: হোস্টিং, অ্যানালিটিক্স) সাথে প্রয়োজনীয় তথ্য শেয়ার করি। এই সব ক্ষেত্রে আমরা তথ্যের নিরাপত্তা ও গোপনীয়তা নিশ্চিত করার চেষ্টা করি।",
    },
    {
      title: "৬. আপনার অধিকার",
      icon: UserX,
      content:
        "আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন করা বা মুছে ফেলার অধিকার আপনার রয়েছে। যেকোনো সময় আমাদের সাথে যোগাযোগ করে আপনার তথ্য সম্পর্কে জানতে বা পরিবর্তন চাইতে পারেন।",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1000px] px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">গোপনীয়তা নীতি</h1>
          <div className="mx-auto mt-4 h-1 w-20 bg-primary"></div>
          <p className="mt-4 text-ink-muted">সর্বশেষ আপডেট: ১৭ আগস্ট ২০২৬</p>
        </div>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <Card key={idx} className="border-none bg-accent/30 shadow-sm transition-all hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <section.icon size={24} />
                </div>
                <CardTitle className="font-display text-xl font-bold">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-ink-muted">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-primary/5 p-8 text-center border border-primary/10">
          <h2 className="font-display text-2xl font-bold text-ink">প্রশ্ন বা মতামত?</h2>
          <p className="mt-2 text-ink-muted">
            গোপনীয়তা নীতি সংক্রান্ত যেকোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
          </p>
          <a
            href="mailto:privacy@provatbanglanews.com"
            className="mt-4 inline-block font-bold text-primary hover:underline"
          >
            privacy@provatbanglanews.com
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
