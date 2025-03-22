
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMessageHandling = (currentUserId: string | null, currentConversationId: string | null) => {
  const { toast } = useToast();

  const updateConversation = async (conversationId: string, content: string) => {
    console.log('Updating conversation:', { conversationId, content });
    
    try {
      // First check if the conversation exists and needs a title update
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        throw fetchError;
      }
      
      // Prepare update data
      const updateData: { last_message_at: string; title?: string } = {
        last_message_at: new Date().toISOString()
      };
      
      // Only update title if it's currently empty
      if (!conversation.title || conversation.title === '') {
        // Generate title from message content (max 50 chars)
        const trimmedContent = content.replace(/[^\w\s]/gi, '').trim();
        updateData.title = trimmedContent.length > 50 
          ? `${trimmedContent.substring(0, 47)}...` 
          : trimmedContent || 'New Chat';
      }
      
      // Update the conversation
      const { error: updateError } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        throw updateError;
      }
      
      console.log('Conversation updated successfully', updateData);
    } catch (error) {
      console.error('Error in updateConversation:', error);
      throw error;
    }
  };

  const insertUserMessage = async (content: string, conversationId: string) => {
    console.log('Inserting user message:', { content, conversationId });
    
    try {
      // First update the conversation
      await updateConversation(conversationId, content);
      
      // Then insert the message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: conversationId
          }
        ])
        .select()
        .single();

      if (userMessageError) throw userMessageError;
      console.log('User message inserted successfully:', userMessage);
      return userMessage;
    } catch (error) {
      console.error('Error in insertUserMessage:', error);
      throw error;
    }
  };

  const insertAIMessage = async (content: string, conversationId: string) => {
    console.log('Inserting AI message:', { conversationId });
    try {
      // Update conversation with AI response
      await updateConversation(conversationId, content);
      
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: null,
            role: 'assistant',
            conversation_id: conversationId
          }
        ]);

      if (aiMessageError) throw aiMessageError;
      console.log('AI message inserted successfully');
    } catch (error) {
      console.error('Error in insertAIMessage:', error);
      throw error;
    }
  };

  return {
    updateConversation,
    insertUserMessage,
    insertAIMessage
  };
};
