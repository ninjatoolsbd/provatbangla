export function slugify(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base || "news"}-${Math.random().toString(36).slice(2, 7)}`;
}

/** HTML সরিয়ে প্রথম অনুচ্ছেদ থেকে সারসংক্ষেপ তৈরি করে। */
export function firstParagraph(html: string | null | undefined, max = 220) {
  const raw = String(html ?? "");
  const blocks = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/<\/(?:p|div|h[1-6]|li|blockquote)>/i)
    .map((b) => b.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim())
    .filter((b) => b.length > 0);
  const text = blocks.find((b) => b.length >= 40) ?? blocks[0] ?? "";
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

/** excerpt থাকলে সেটিই (ট্যাগমুক্ত), না থাকলে কনটেন্টের প্রথম অনুচ্ছেদ। */
export function summarize(
  excerpt: string | null | undefined,
  content?: string | null,
  max = 220,
) {
  const clean = firstParagraph(excerpt, max);
  if (clean) return clean;
  return firstParagraph(content, max);
}
