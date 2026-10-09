import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Customer-facing server functions. Every call requires a signed-in customer account. */

export type PublicMessage = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

const profileInput = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40),
  hair_notes: z.string().trim().max(500),
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("full_name, phone, email, hair_notes")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const email = (context.claims as { email?: string }).email ?? "";
    return data ?? { full_name: "", phone: "", email, hair_notes: "" };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => profileInput.parse(input))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string }).email ?? "";
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, email, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function displayName(context: { supabase: any; userId: string; claims: unknown }) {
  const { data } = await context.supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", context.userId)
    .maybeSingle();
  const email = (context.claims as { email?: string }).email ?? "";
  return {
    name: data?.full_name || email.split("@")[0] || "Customer",
    contact: data?.phone || data?.email || email,
  };
}

/** The signed-in customer's single ongoing conversation with the studio. */
export const getMyConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: convo, error } = await context.supabase
      .from("conversations")
      .select("id")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!convo) return { messages: [] as PublicMessage[] };
    const { data: messages, error: mErr } = await context.supabase
      .from("messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    return { messages: (messages ?? []) as PublicMessage[] };
  });

export const sendMyMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ body: z.string().trim().min(1).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    let conversationId = existing?.id as string | undefined;
    if (!conversationId) {
      const who = await displayName(context);
      const { data: created, error } = await supabaseAdmin
        .from("conversations")
        .insert({ customer_name: who.name, contact: who.contact, user_id: context.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      conversationId = created.id;
    }
    const { error } = await supabaseAdmin
      .from("messages")
      .insert({ conversation_id: conversationId!, sender: "customer", body: data.body });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), unread_for_owner: true })
      .eq("id", conversationId!);
    return { ok: true };
  });

const bookingInput = z.object({
  service_name: z.string().trim().min(2).max(120),
  customer_name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(5).max(120),
  preferred_date: z.string().trim().min(1).max(20),
  preferred_time: z.string().trim().max(20),
  notes: z.string().trim().max(500),
});

export const submitBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => bookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, service_name, preferred_date, preferred_time, status, notes, created_at")
      .eq("user_id", context.userId)
      .order("preferred_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
