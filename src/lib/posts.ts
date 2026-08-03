import { supabase } from "@/integrations/my-supabase/client";

export type Post = {
  id: string;
  title: string;
  slug: string | null;
  kicker: string | null;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: string;
  seo_title: string | null;
  seo_description: string | null;
  status: string;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function slugify(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base || "news"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function paragraphs(content: string) {
  return content
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function banglaDateTime(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export async function fetchPublishedPosts(limit = 12, category?: string) {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Post | null;
}

export async function fetchAllPostsForAdmin() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Post[];
}
