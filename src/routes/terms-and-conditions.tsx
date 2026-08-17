import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, ShieldCheck, FileText, Gavel, UserCheck } from "lucide-react";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "ব্যবহারের শর্তাবলি — প্রভাতবাংলা" },
      {
        name: "description",
        content: "প্রভাতবাংলা নিউজ পোর্টালের ব্যবহারের শর্তাবলি এবং নিয়মকানুন সম্পর্কে জানুন।",
      },
      { property: "og:title", content: "ব্যবহারের শর্তাবলি — প্রভাতবাংলা" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  const sections = [
    {
      title: "১. ব্যবহারের শর্তাবলি গ্রহণ",
      icon: ShieldCheck,
      content:
        "প্রভাতবাংলা নিউজ পোর্টালে (provatbanglanews.com) আপনাকে স্বাগতম। এই ওয়েবসাইটটি ব্যবহারের মাধ্যমে আপনি আমাদের সকল শর্তাবলি এবং নিয়মকানুন মেনে নিচ্ছেন বলে গণ্য হবে। আপনি যদি এই শর্তাবলির কোনো অংশের সাথে একমত না হন, তবে দয়া করে ওয়েবসাইটটি ব্যবহার করবেন না।",
    },
    {
      title: "২. বিষয়বস্তু বা কন্টেন্ট",
      icon: FileText,
      content:
        "এই সাইটের সকল সংবাদ, নিবন্ধ, ছবি, গ্রাফিক্স, লোগো এবং অন্যান্য বিষয়বস্তু প্রভাতবাংলা বা এর লাইসেন্সদাতাদের মেধা সম্পদ। পূর্ব অনুমতি ব্যতীত কোনো কন্টেন্ট বাণিজ্যিক উদ্দেশ্যে কপি, পুনঃপ্রকাশ বা বিতরণ করা আইনত দণ্ডনীয় অপরাধ। তবে ব্যক্তিগত বা অ-বাণিজ্যিক প্রয়োজনে সূত্র উল্লেখ করে শেয়ার করা যেতে পারে।",
    },
    {
      title: "৩. ব্যবহারকারীর আচরণ",
      icon: UserCheck,
      content:
        "সাইটটি ব্যবহারের সময় আপনাকে প্রচলিত আইন মেনে চলতে হবে। কোনো সংবাদে মন্তব্য করার ক্ষেত্রে অশ্লীল, মানহানিকর, উস্কানিমূলক বা সাম্প্রদায়িক সম্প্রীতি নষ্ট করে এমন ভাষা ব্যবহার থেকে বিরত থাকতে হবে। প্রভাতবাংলা কর্তৃপক্ষ কোনো নোটিশ ছাড়াই যেকোনো মন্তব্য মুছে ফেলার অধিকার সংরক্ষণ করে।",
    },
    {
      title: "৪. দায়মুক্তি (Disclaimer)",
      icon: Scale,
      content:
        "আমরা তথ্যের নির্ভুলতা বজায় রাখার সর্বোচ্চ চেষ্টা করি। তবে সংবাদের কোনো তথ্যের ভিত্তিতে কাজ করার আগে তার সত্যতা যাচাই করার দায়িত্ব ব্যবহারকারীর। তথ্যের কোনো ভুল বা অসম্পূর্ণতার জন্য প্রভাতবাংলা কর্তৃপক্ষ দায়ী থাকবে না।",
    },
    {
      title: "৫. শর্তাবলি পরিবর্তন",
      icon: Gavel,
      content:
        "প্রভাতবাংলা যেকোনো সময় এই শর্তাবলি পরিবর্তন বা পরিমার্জন করার অধিকার রাখে। পরিবর্তিত শর্তাবলি সাইটে প্রকাশের সাথে সাথেই কার্যকর হবে। তাই নিয়মিত এই পেজটি চেক করার অনুরোধ রইল।",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1000px] px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">ব্যবহারের শর্তাবলি</h1>
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
          <h2 className="font-display text-2xl font-bold text-ink">কোনো প্রশ্ন আছে?</h2>
          <p className="mt-2 text-ink-muted">
            শর্তাবলি সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন।
          </p>
          <a
            href="mailto:legal@provatbanglanews.com"
            className="mt-4 inline-block font-bold text-primary hover:underline"
          >
            legal@provatbanglanews.com
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
