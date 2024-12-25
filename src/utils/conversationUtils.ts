import { supabase } from "@/integrations/supabase/client";

export const updateConversationTitle = async (conversationId: string, content: string) => {
  console.log('Updating conversation title for:', conversationId);
  // Generate a title from the first message content (max 50 chars)
  const title = content.length > 50 ? `${content.substring(0, 47)}...` : content;
  
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
    
    console.log('Conversation title updated successfully:', title);
  } catch (error) {
    console.error('Failed to update conversation title:', error);
  }
};

export const loadConversationMessages = async (conversationId: string) => {
  console.log('Loading messages for conversation:', conversationId);
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading conversation messages:', error);
    throw error;
  }

  console.log('Loaded messages:', messages?.length || 0, 'messages');
  return messages || [];
};