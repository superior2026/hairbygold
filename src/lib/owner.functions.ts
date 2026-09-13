import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertOwner(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "owner",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getOwnerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "owner",
    });
    return { isOwner: Boolean(data), userId: context.userId };
  });

/** One-time bootstrap: the first account to claim the studio becomes the owner. */
export const claimOwnerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) return { claimed: false as const };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "owner" });
    if (error) throw new Error(error.message);
    return { claimed: true as const };
  });

export const listOwnerProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertOwner(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(120),
  price: z.number().positive().max(1000000),
  category: z.string().trim().min(1).max(60),
  length: z.string().trim().max(20),
  texture: z.string().trim().max(40),
  description: z.string().trim().min(10).max(2000),
  in_stock: z.boolean(),
  image_key: z.string().trim().max(40),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("products").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("products")
      .insert(fields)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id as string };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertOwner(context);
    const { data, error } = await context.supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConversationThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ conversationId: z.string().uuid(), markRead: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    if (data.markRead) {
      await context.supabase
        .from("conversations")
        .update({ unread_for_owner: false })
        .eq("id", data.conversationId);
    }
    const { data: messages, error } = await context.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return messages ?? [];
  });

export const replyToConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ conversationId: z.string().uuid(), body: z.string().trim().min(1).max(2000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase
      .from("messages")
      .insert({ conversation_id: data.conversationId, sender: "owner", body: data.body });
    if (error) throw new Error(error.message);
    await context.supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), unread_for_owner: false })
      .eq("id", data.conversationId);
    return { ok: true };
  });

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertOwner(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "declined", "done"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOwner(context);
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
