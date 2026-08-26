import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCloudAuth } from "@/lib/cloud-auth.middleware";

const roleSchema = z.enum(["admin", "editor", "user"]);

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("শুধু অ্যাডমিন ইউজার ব্যবস্থাপনা করতে পারবেন।");
}

export type ManagedUser = {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "editor" | "user";
  createdAt: string;
  lastSignInAt: string | null;
};

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .handler(async ({ context }): Promise<ManagedUser[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleOf = new Map<string, ManagedUser["role"]>();
    for (const r of roles ?? []) {
      const current = roleOf.get(r.user_id as string);
      const next = r.role as ManagedUser["role"];
      // admin > editor > user
      if (!current || next === "admin" || (next === "editor" && current === "user")) {
        roleOf.set(r.user_id as string, next);
      }
    }

    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      displayName:
        (u.user_metadata?.["display_name"] as string | undefined) ??
        (u.email ?? "").split("@")[0] ??
        "",
      role: roleOf.get(u.id) ?? "user",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }));
  });

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().default(""),
        role: roleSchema.default("editor"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.displayName || data.email.split("@")[0] },
    });
    if (error) throw new Error(error.message);
    const userId = created.user?.id;
    if (!userId) throw new Error("ইউজার তৈরি হয়নি।");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (roleError) throw new Error(roleError.message);

    return { id: userId };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), role: roleSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && data.role !== "admin") {
      throw new Error("নিজের অ্যাডমিন অনুমতি সরানো যাবে না।");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না।");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
