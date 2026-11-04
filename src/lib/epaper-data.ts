import { supabase } from "@/integrations/supabase/client";
import type { EpaperPost } from "@/components/epaper-sheet";

export type EpaperEdition = {
  id: string;
  title: string;
  edition_date: string;
  week_start: string | null;
  week_end: string | null;
  post_ids: string[];
};

const POST_COLS = "id,title,excerpt,content,category,image_url,slug,view_count,published_at,created_at";

export async function loadEpaper(id?: string) {
  try {
    const { data: list } = await supabase
      .from("epaper_editions")
      .select("id,title,edition_date,week_start,week_end,post_ids")
      .eq("is_published", true)
      .order("edition_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);
    const editions = ((list as EpaperEdition[]) ?? []).filter((e) => e.post_ids?.length);
    const edition = (id && editions.find((e) => e.id === id)) || editions[0] || null;
    let posts: EpaperPost[] = [];
    if (edition) {
      const { data } = await supabase
        .from("posts")
        .select(POST_COLS)
        .in("id", edition.post_ids)
        .eq("status", "published");
      posts = (data as EpaperPost[]) ?? [];
    }
    return { editions, edition, posts };
  } catch {
    return { editions: [] as EpaperEdition[], edition: null, posts: [] as EpaperPost[] };
  }
}

export const editionLabel = (e: EpaperEdition, fmt: (d: string) => string) =>
  e.week_start ? `${fmt(e.week_start)} – ${fmt(e.edition_date)}` : fmt(e.edition_date);
