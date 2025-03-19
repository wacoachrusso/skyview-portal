
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Fetches messages for a specific conversation
 */
export async function fetchConversationMessages(conversationId: string) {
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    throw messagesError;
  }

  console.log('Messages fetched successfully, count:', messages?.length);
  return messages;
}

/**
 * Updates the conversation to mark it as downloaded
 */
export async function markConversationAsDownloaded(conversationId: string) {
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ downloaded_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    console.error('Error updating downloaded_at:', updateError);
    throw updateError;
  }
}

/**
 * Refreshes the conversations query cache
 */
export function refreshConversationsCache(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ['conversations'] });
}
