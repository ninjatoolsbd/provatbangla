import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, insertRow, listRows, updateRow, type Row } from "@/lib/cms";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "date" | "select";

export type FieldDef = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
  hideInList?: boolean;
};

type Props = {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  order?: { column: string; ascending?: boolean };
  rowTitle: (row: Row) => string;
  rowSubtitle?: (row: Row) => string;
  canCreate?: boolean;
};

function emptyForm(fields: FieldDef[]): Row {
  const out: Row = {};
  for (const f of fields) {
    out[f.name] =
      f.defaultValue ?? (f.type === "checkbox" ? false : f.type === "number" ? 0 : "");
  }
  return out;
}

export function ResourceManager({
  table,
  title,
  description,
  fields,
  order = { column: "created_at", ascending: false },
  rowTitle,
  rowSubtitle,
  canCreate = true,
}: Props) {
  const qc = useQueryClient();
  const key = ["cms", table];
  const list = useQuery({ queryKey: key, queryFn: () => listRows(table, order) });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Row>(() => emptyForm(fields));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Row>({});

  const invalidate = () => void qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: () => insertRow(table, form),
    onSuccess: () => {
      toast.success("যোগ করা হয়েছে");
      setForm(emptyForm(fields));
      setCreating(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Row }) => updateRow(table, id, values),
    onSuccess: () => {
      toast.success("সেভ হয়েছে");
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow(table, id),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const renderField = (f: FieldDef, value: Row, setValue: (v: Row) => void) => {
    const common =
      "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
    const v = value[f.name];
    if (f.type === "checkbox") {
      return (
        <label key={f.name} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => setValue({ ...value, [f.name]: e.target.checked })}
          />
          {f.label}
        </label>
      );
    }
    return (
      <label key={f.name} className="block">
        <span className="mb-1 block text-xs text-muted-foreground">{f.label}</span>
        {f.type === "textarea" ? (
          <textarea
            rows={3}
            className={common}
            placeholder={f.placeholder}
            value={String(v ?? "")}
            onChange={(e) => setValue({ ...value, [f.name]: e.target.value })}
          />
        ) : f.type === "select" ? (
          <select
            className={common}
            value={String(v ?? "")}
            onChange={(e) => setValue({ ...value, [f.name]: e.target.value })}
          >
            <option value="">— নির্বাচন করুন —</option>
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
            className={common}
            placeholder={f.placeholder}
            value={String(v ?? "")}
            onChange={(e) =>
              setValue({
                ...value,
                [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
          />
        )}
      </label>
    );
  };

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold text-primary">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setCreating((s) => !s)}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {creating ? <X className="size-4" /> : <Plus className="size-4" />}
            {creating ? "বাতিল" : "নতুন যোগ করুন"}
          </button>
        )}
      </div>

      {creating && (
        <div className="space-y-3 border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => renderField(f, form, setForm))}
          </div>
          <button
            type="button"
            disabled={create.isPending}
            onClick={() => create.mutate()}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            {create.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            সেভ করুন
          </button>
        </div>
      )}

      <div className="border border-border bg-background">
        {list.isLoading && (
          <p className="px-4 py-6 text-sm text-muted-foreground">লোড হচ্ছে…</p>
        )}
        {!list.isLoading && rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">এখনো কিছু নেই।</p>
        )}
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={String(row['id'])} className="px-4 py-3">
              {editingId === row['id'] ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fields.map((f) => renderField(f, editForm, setEditForm))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({ id: String(row['id']), values: editForm })
                      }
                      className="bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                    >
                      সেভ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="border border-border px-3 py-1.5 text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold">{rowTitle(row)}</p>
                    {rowSubtitle && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{rowSubtitle(row)}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next: Row = {};
                        for (const f of fields) next[f.name] = row[f.name];
                        setEditForm(next);
                        setEditingId(String(row['id']));
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("মুছে ফেলবেন?")) remove.mutate(String(row['id']));
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="ডিলিট"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
