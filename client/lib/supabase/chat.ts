import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();

export async function getGlobalMessages(pageParam = 0) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .is("conversation_id", null)
    .order("created_at", { ascending: false })
    .range(pageParam * 100, (pageParam + 1) * 100 - 1);

  if (error) throw error;
  return data;
}

export async function getDMMessages(conversationId: string, pageParam = 0) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .range(pageParam * 100, (pageParam + 1) * 100 - 1);

  if (error) throw error;
  return data;
}

export async function sendGlobalMessage(message: {
  senderId: string;
  senderRole: string;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
}) {
  const { data, error } = await supabase.from("messages").insert({
    sender_id: message.senderId,
    sender_role: message.senderRole,
    sender_name: message.senderName,
    sender_avatar_url: message.senderAvatarUrl,
    content: message.content,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function sendDMMessage(
  conversationId: string,
  message: {
    senderId: string;
    senderRole: string;
    senderName: string;
    senderAvatarUrl: string | null;
    content: string;
  }
) {
  const { data, error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: message.senderId,
    sender_role: message.senderRole,
    sender_name: message.senderName,
    sender_avatar_url: message.senderAvatarUrl,
    content: message.content,
  }).select().single();

  // Also update lastMessageAt in conversation
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);

  if (error) throw error;
  return data;
}

export async function deleteMessage(messageId: string, userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .update({ is_deleted: true, deleted_by: userId })
    .eq("id", messageId);

  if (error) throw error;
  return data;
}

export async function getConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      student:student_id (id, user_details (first_name, last_name, avatar)),
      teacher:teacher_id (id, user_details (first_name, last_name, avatar)),
      course:class_id (course_id, name)
    `)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data;
}

export async function markAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw error;
}

export async function getTeachersForStudent(studentId: string) {
    // This is a bit complex as we need to query Prisma's relations.
    // In a real scenario we'd create an API endpoint in NextJS that uses Prisma to fetch this,
    // or we'd query Supabase directly if we duplicate data.
    // For now we will assume the caller fetches this via an API route.
    return [];
}
