
import { supabase } from "@/integrations/supabase/client";

/**
 * Format a date string into a human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // For today's dates, show time only
  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // For past dates, show abbreviated date and time
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Update a conversation's title based on message content
 */
export const updateConversationTitle = async (conversationId: string, content: string) => {
  if (!conversationId) {
    console.error('No conversation ID provided for title update');
    return;
  }

  console.log('Updating conversation title for:', conversationId);
  
  try {
    // First check if conversation already has a title
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('title')
      .eq('id', conversationId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      throw fetchError;
    }
    
    // Only update title if it's empty or a default title
    const shouldUpdateTitle = !existingConversation?.title || existingConversation.title === 'New Chat' || existingConversation.title === '';
    
    if (shouldUpdateTitle) {
      // Generate a more meaningful title from the message content (max 50 chars)
      // Remove special characters and trim whitespace
      const trimmedContent = content.replace(/[^\w\s]/gi, '').trim();
      const title = trimmedContent.length > 50 ? `${trimmedContent.substring(0, 47)}...` : trimmedContent;
      
      if (title) {
        const { error } = await supabase
          .from('conversations')
          .update({ title })
          .eq('id', conversationId);

        if (error) {
          console.error('Error updating conversation title:', error);
          throw error;
        }
        
        console.log('Conversation title updated successfully:', title);
      }
    } else {
      console.log('Conversation already has a title, not updating:', existingConversation.title);
    }
  } catch (error) {
    console.error('Failed to update conversation title:', error);
  }
};

/**
 * Load messages for a conversation
 */
export const loadConversationMessages = async (conversationId: string) => {
  if (!conversationId) {
    console.error('No conversation ID provided for loading messages');
    return [];
  }

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

/**
 * Set up real-time messaging channel for a conversation
 */
export const setupMessageChannel = (conversationId: string, onNewMessage: (message: any) => void) => {
  if (!conversationId) {
    console.error('No conversation ID provided for channel setup');
    return null;
  }

  console.log(`Setting up real-time channel for conversation: ${conversationId}`);
  
  const channel = supabase
    .channel(`messages_${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('New message received via real-time:', payload);
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return channel;
};
