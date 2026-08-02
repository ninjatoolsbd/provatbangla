export function slugify(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base || "news"}-${Math.random().toString(36).slice(2, 7)}`;
}
