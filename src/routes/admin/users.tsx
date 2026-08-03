import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserAccount,
  deleteUserAccount,
  listUsers,
  setUserRole,
  type ManagedUser,
} from "@/lib/users.functions";
import { banglaDateTime } from "@/lib/posts";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "ইউজার ও অথর — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "অথর অ্যাকাউন্ট যোগ করুন, রোল বদলান বা মুছে ফেলুন।" },
      { property: "og:title", content: "ইউজার ও অথর — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "অথর ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsersPage,
});

const roleLabel: Record<ManagedUser["role"], string> = {
  admin: "অ্যাডমিন",
  editor: "অথর",
  user: "সাধারণ",
};

function UsersPage() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const createUser = useServerFn(createUserAccount);
  const changeRole = useServerFn(setUserRole);
  const removeUser = useServerFn(deleteUserAccount);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<ManagedUser["role"]>("editor");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({ data: undefined }),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-users"] });

  const addMutation = useMutation({
    mutationFn: () => createUser({ data: { email, password, displayName, role } }),
    onSuccess: () => {
      toast.success("নতুন অ্যাকাউন্ট তৈরি হয়েছে");
      setEmail("");
      setPassword("");
      setDisplayName("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: (p: { userId: string; role: ManagedUser["role"] }) => changeRole({ data: p }),
    onSuccess: () => {
      toast.success("রোল আপডেট হয়েছে");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => removeUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("অ্যাকাউন্ট মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-bold text-primary">ইউজার ও অথর</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          অথর অ্যাকাউন্ট তৈরি করুন — অথররা শুধু নিউজ লিখতে ও পাবলিশ করতে পারবেন।
        </p>
      </div>

      <section className="border border-border bg-background p-4">
        <h2 className="mb-3 font-display text-base font-bold">নতুন অ্যাকাউন্ট যোগ করুন</h2>
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim() || password.length < 6) {
              toast.error("সঠিক ইমেইল ও অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন");
              return;
            }
            addMutation.mutate();
          }}
        >
          <Input
            placeholder="নাম"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select value={role} onValueChange={(v) => setRole(v as ManagedUser["role"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">অথর</SelectItem>
              <SelectItem value="admin">অ্যাডমিন</SelectItem>
              <SelectItem value="user">সাধারণ</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {addMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            যোগ করুন
          </button>
        </form>
      </section>

      <section className="border border-border bg-background">
        {usersQuery.isLoading ? (
          <div className="grid place-items-center p-10">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : usersQuery.isError ? (
          <p className="p-6 text-sm text-destructive">
            {(usersQuery.error as Error).message}
          </p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">কোনো ইউজার নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">নাম</th>
                  <th className="px-4 py-3">ইমেইল</th>
                  <th className="px-4 py-3">রোল</th>
                  <th className="px-4 py-3">যোগদান</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{u.displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) =>
                          roleMutation.mutate({ userId: u.id, role: v as ManagedUser["role"] })
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue>{roleLabel[u.role]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">অথর</SelectItem>
                          <SelectItem value="admin">অ্যাডমিন</SelectItem>
                          <SelectItem value="user">সাধারণ</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {banglaDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`${u.email} মুছে ফেলবেন?`)) deleteMutation.mutate(u.id);
                        }}
                        className="inline-flex items-center gap-1 border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" /> মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
