import { createFileRoute } from "@tanstack/react-router";

import { ResourceManager } from "@/components/admin/resource-manager";

const meta = (t: string, d: string) => ({
  meta: [
    { title: t },
    { name: "description", content: d },
    { property: "og:title", content: t },
    { property: "og:description", content: d },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ],
});

export const Route = createFileRoute("/admin/ads")({
  head: () => meta("বিজ্ঞাপন — প্রভাতবাংলা অ্যাডমিন", "সাইটের বিজ্ঞাপন ব্যানার ব্যবস্থাপনা।"),
  component: () => (
    <ResourceManager
      table="ads"
      title="বিজ্ঞাপন"
      description="ব্যানার বিজ্ঞাপন যোগ করুন ও কোথায় দেখাবে ঠিক করুন।"
      fields={[
        { name: "title", label: "বিজ্ঞাপনের নাম", type: "text" },
        {
          name: "placement",
          label: "অবস্থান",
          type: "select",
          defaultValue: "header",
          options: [
            { value: "header", label: "হেডার" },
            { value: "home_top", label: "হোম — উপরে" },
            { value: "home_mid", label: "হোম — মাঝে" },
            { value: "sidebar", label: "সাইডবার" },
            { value: "article", label: "নিউজ পেজ" },
            { value: "footer", label: "ফুটার" },
          ],
        },
        { name: "image_url", label: "ব্যানার ছবির লিংক", type: "text" },
        { name: "link_url", label: "ক্লিকে যাবে যেখানে", type: "text" },
        { name: "starts_at", label: "শুরু (ঐচ্ছিক)", type: "date" },
        { name: "ends_at", label: "শেষ (ঐচ্ছিক)", type: "date" },
        { name: "is_active", label: "সক্রিয়", type: "checkbox", defaultValue: true },
      ]}
      rowTitle={(r) => String(r["title"] ?? "")}
      rowSubtitle={(r) =>
        `${r["placement"] ?? ""} · ${r["is_active"] ? "সক্রিয়" : "নিষ্ক্রিয়"}`
      }
    />
  ),
});
