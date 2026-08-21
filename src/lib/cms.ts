import type { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/** Untyped view of the client for CMS tables that are not in the generated types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as unknown as SupabaseClient<any, "public", any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export async function listRows(
  table: string,
  order: { column: string; ascending?: boolean } = { column: "created_at", ascending: false },
  limit = 2000,
): Promise<Row[]> {
  const { data, error } = await db
    .from(table)
    .select("*")
    .order(order.column, { ascending: order.ascending ?? false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Exact row count for a table without pulling rows. */
export async function countRows(table: string): Promise<number> {
  const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}


export async function insertRow(table: string, values: Row) {
  // If we suspect the 'lang' column is missing, strip it preemptively if it's there
  // This is a more robust fix for the "hynai, new site add kroa jassena" issue
  const { lang, ...valuesWithoutLang } = values;
  
  // Try with all values first
  const { error } = await db.from(table).insert(values);
  
  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    // If the error is about a missing column, retry without 'lang'
    if (error.code === '42703' || (error.message && (error.message.includes("column") || error.message.includes("lang")))) {
      console.warn(`Column missing in table ${table}, retrying without 'lang'...`);
      const { error: retryError } = await db.from(table).insert(valuesWithoutLang);
      if (retryError) throw retryError;
      return;
    }
    throw error;
  }
}

export async function updateRow(table: string, id: string, values: Row, idColumn = "id") {
  const { error } = await db.from(table).update(values).eq(idColumn, id);
  if (error) {
    if (error.code === '42703' || (error.message && error.message.includes("column") && error.message.includes("does not exist"))) {
      const { lang, ...rest } = values;
      const { error: retryError } = await db.from(table).update(rest).eq(idColumn, id);
      if (retryError) throw retryError;
      return;
    }
    throw error;
  }
}

export async function deleteRow(table: string, id: string, idColumn = "id") {
  const { error } = await db.from(table).delete().eq(idColumn, id);
  if (error) throw error;
}

export type CategoryRow = { id: string; slug: string; name: string; sort_order: number; is_active: boolean };

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export function useCategories() {
  return useQuery({ queryKey: ["cms-categories"], queryFn: fetchCategories });
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await db.from("site_settings").select("*");
  if (error) throw error;
  const out: Record<string, string> = {};
  for (const row of data ?? []) out[row.key as string] = (row.value as string) ?? "";
  return out;
}

export async function saveSetting(key: string, value: string) {
  const { error } = await db
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}
