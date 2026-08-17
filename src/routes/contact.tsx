import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Users, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — প্রভাতবাংলা" },
      {
        name: "description",
        content: "প্রভাতবাংলা নিউজ পোর্টালের সাথে যোগাযোগ করুন। সংবাদ, বিজ্ঞাপন ও অন্যান্য প্রয়োজনে আমাদের ঠিকানা, ফোন ও ইমেইল পান।",
      },
      { property: "og:title", content: "যোগাযোগ — প্রভাতবাংলা" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const contactInfo = [
    {
      title: "সম্পাদক ও প্রকাশক",
      icon: Users,
      details: ["ডেমো সম্পাদক", "প্রভাতবাংলা ডেমো মিডিয়া লিমিটেড"],
    },
    {
      title: "বার্তাকক্ষ ও বাণিজ্যিক কার্যালয়",
      icon: MapPin,
      details: ["বাড়ি ৩৯১, রোড ২৯, নিউ ডিওএইচএস, মহাখালী, ঢাকা ১২০৬"],
    },
    {
      title: "ফোন",
      icon: Phone,
      details: ["০২-৫৫০০০০০০", "০১৭০০-০০০০০০"],
    },
    {
      title: "ইমেইল",
      icon: Mail,
      details: ["news@demo-kalbela.test", "ad@demo-kalbela.test"],
    },
    {
      title: "কার্যালয়ের সময়",
      icon: Clock,
      details: ["শনিবার - বৃহস্পতিবার: সকাল ৯টা - রাত ৯টা", "শুক্রবার: সকাল ১০টা - বিকেল ৬টা"],
    },
  ];

  const departments = [
    { name: "সাংবাদিক বিভাগ", email: "news@demo-kalbela.test" },
    { name: "বিজ্ঞাপন বিভাগ", email: "ad@demo-kalbela.test" },
    { name: "প্রযুক্তি বিভাগ", email: "tech@demo-kalbela.test" },
    { name: "অভিযোগ ও মতামত", email: "feedback@demo-kalbela.test" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">যোগাযোগ</h1>
          <div className="mx-auto mt-4 h-1 w-20 bg-primary"></div>
          <p className="mt-4 text-ink-muted">
            সংবাদ, বিজ্ঞাপন বা যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* contact info */}
          <div className="grid gap-6">
            {contactInfo.map((info, idx) => (
              <Card key={idx} className="border-none bg-accent/30 shadow-sm transition-all hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <info.icon size={24} />
                  </div>
                  <CardTitle className="font-display text-xl font-bold">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-ink-muted">
                    {info.details.map((detail, dIdx) => (
                      <li key={dIdx}>{detail}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* departments and form */}
          <div className="space-y-8">
            <Card className="border-none bg-accent/30 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-2xl font-bold">বিভাগভিত্তিক যোগাযোগ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="rounded-lg bg-background p-4 shadow-sm">
                      <h3 className="font-display font-bold text-ink">{dept.name}</h3>
                      <a
                        href={`mailto:${dept.email}`}
                        className="mt-1 block text-sm text-primary hover:underline"
                      >
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-accent/30 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-2xl font-bold flex items-center gap-2">
                  <Send className="size-6 text-primary" />
                  আমাদের লিখুন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-ink">নাম</label>
                      <input
                        type="text"
                        placeholder="আপনার নাম"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-ink">ইমেইল</label>
                      <input
                        type="email"
                        placeholder="আপনার ইমেইল"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">বিষয়</label>
                    <input
                      type="text"
                      placeholder="বার্তার বিষয়"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">বার্তা</label>
                    <textarea
                      rows={5}
                      placeholder="আপনার বার্তা লিখুন..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    পাঠান
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
