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
  view_count?: number; // Optional as it might be added later
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
  
  // Use a fixed locale to prevent hydration mismatch
  // banglaDateTime is often used in SSR, so we must be careful with locale formatting
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("bn-BD", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Dhaka", // Use a fixed timezone to prevent mismatch
    }).format(date);
  } catch (e) {
    return "";
  }
}

export function getCurrentBanglaDate() {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  };
  return new Intl.DateTimeFormat("bn-BD", options).format(new Date());
}

export async function fetchPublishedPosts(limit = 12, category?: string, sort: 'latest' | 'popular' = 'latest') {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published");

  if (category) q = q.eq("category", category);

  if (sort === 'popular') {
    // If view_count exists, use it. Otherwise, randomish but stable for demo
    q = q.order("view_count", { ascending: false, nullsFirst: false });
  } else {
    q = q.order("published_at", { ascending: false });
  }

  const { data, error } = await q.limit(limit);
  if (error) {
    // Fallback if view_count doesn't exist yet
    if (sort === 'popular' && error.code === '42703') {
      return fetchPublishedPosts(limit, category, 'latest');
    }
    throw error;
  }
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

/** Fetches every post for the admin area, paginating past the API row cap. */
export async function fetchAllPostsForAdmin() {
  const pageSize = 1000;
  const out: Post[] = [];
  for (let page = 0; page < 50; page++) {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as Post[];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

/** Exact counts straight from the database (no row limit involved). */
export async function fetchPostCounts() {
  const countOf = async (status?: string) => {
    let q = supabase.from("posts").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  };
  const [total, published] = await Promise.all([countOf(), countOf("published")]);
  return { total, published, drafts: total - published };
}
