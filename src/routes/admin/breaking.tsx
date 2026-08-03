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

export const Route = createFileRoute("/admin/breaking")({
  head: () => meta("ব্রেকিং নিউজ — প্রভাতবাংলা অ্যাডমিন", "হোমপেজের ব্রেকিং টিকারের হেডলাইন ব্যবস্থাপনা।"),
  component: () => (
    <ResourceManager
      table="breaking_news"
      title="ব্রেকিং নিউজ"
      description="হোমপেজের উপরের স্ক্রলিং টিকারে যা দেখাবে।"
      order={{ column: "sort_order", ascending: true }}
      fields={[
        { name: "text", label: "হেডলাইন", type: "text", placeholder: "সংক্ষিপ্ত ব্রেকিং হেডলাইন" },
        { name: "link", label: "লিংক (ঐচ্ছিক)", type: "text", placeholder: "/post/slug" },
        { name: "sort_order", label: "ক্রম", type: "number", defaultValue: 0 },
        { name: "is_active", label: "সক্রিয়", type: "checkbox", defaultValue: true },
      ]}
      rowTitle={(r) => String(r["text"] ?? "")}
      rowSubtitle={(r) =>
        `${r["is_active"] ? "সক্রিয়" : "নিষ্ক্রিয়"} · ক্রম ${r["sort_order"] ?? 0}`
      }
    />
  ),
});
