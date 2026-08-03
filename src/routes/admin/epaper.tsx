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

export const Route = createFileRoute("/admin/epaper")({
  head: () => meta("ই-পেপার — প্রভাতবাংলা অ্যাডমিন", "ই-পেপার সংস্করণ যোগ ও ব্যবস্থাপনা।"),
  component: () => (
    <ResourceManager
      table="epaper_editions"
      title="ই-পেপার সংস্করণ"
      description="প্রতিদিনের ই-পেপার সংস্করণ যোগ করুন (কভার ছবি ও PDF লিংক)।"
      order={{ column: "edition_date", ascending: false }}
      fields={[
        { name: "title", label: "শিরোনাম", type: "text", defaultValue: "প্রভাতবাংলা" },
        { name: "edition_date", label: "তারিখ", type: "date" },
        { name: "cover_url", label: "কভার ছবির লিংক", type: "text" },
        { name: "pdf_url", label: "PDF লিংক", type: "text" },
        { name: "is_published", label: "প্রকাশিত", type: "checkbox", defaultValue: true },
      ]}
      rowTitle={(r) => `${r["title"] ?? ""} — ${r["edition_date"] ?? ""}`}
      rowSubtitle={(r) => (r["is_published"] ? "প্রকাশিত" : "অপ্রকাশিত")}
    />
  ),
});
