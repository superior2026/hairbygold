import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Public-facing server functions: visitor chat with the studio and booking requests. */

export type PublicMessage = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

const startChatInput = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(5).max(120),
  message: z.string().trim().min(2).max(2000),
});

export const startConversation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => startChatInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .insert({ customer_name: data.name, contact: data.contact })
      .select("id, access_token")
      .single();
    if (error) throw new Error(error.message);
    const { error: messageError } = await supabaseAdmin
      .from("messages")
      .insert({ conversation_id: conversation.id, sender: "customer", body: data.message });
    if (messageError) throw new Error(messageError.message);
    return { token: conversation.access_token as string };
  });

const tokenSchema = z.string().uuid();

async function resolveConversation(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("id, customer_name")
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { supabaseAdmin, conversation: data };
}

export const getConversation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: tokenSchema }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, conversation } = await resolveConversation(data.token);
    if (!conversation) return { found: false as const, messages: [] as PublicMessage[], name: "" };
    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return {
      found: true as const,
      name: conversation.customer_name as string,
      messages: (messages ?? []) as PublicMessage[],
    };
  });

export const sendCustomerMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: tokenSchema, body: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, conversation } = await resolveConversation(data.token);
    if (!conversation) throw new Error("Conversation not found");
    const { error } = await supabaseAdmin
      .from("messages")
      .insert({ conversation_id: conversation.id, sender: "customer", body: data.body });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), unread_for_owner: true })
      .eq("id", conversation.id);
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
  .inputValidator((input: unknown) => bookingInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
