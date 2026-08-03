import type { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/my-supabase/client";

/** Untyped view of the client for CMS tables that are not in the generated types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as unknown as SupabaseClient<any, "public", any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export async function listRows(
  table: string,
  order: { column: string; ascending?: boolean } = { column: "created_at", ascending: false },
  limit = 200,
): Promise<Row[]> {
  const { data, error } = await db
    .from(table)
    .select("*")
    .order(order.column, { ascending: order.ascending ?? false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function insertRow(table: string, values: Row) {
  const { error } = await db.from(table).insert(values);
  if (error) throw error;
}

export async function updateRow(table: string, id: string, values: Row, idColumn = "id") {
  const { error } = await db.from(table).update(values).eq(idColumn, id);
  if (error) throw error;
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
