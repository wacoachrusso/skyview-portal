import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMessageHandling = (currentUserId: string | null, currentConversationId: string | null) => {
  const { toast } = useToast();

  const updateConversation = async (conversationId: string, content: string) => {
    console.log('Updating conversation:', { conversationId, content });
    
    // Truncate content for title, remove special characters and keep first 50 chars
    const title = content
      .replace(/[^\w\s]/gi, '')
      .trim()
      .slice(0, 50);
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        title: title || 'New Chat'
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw updateError;
    }
    
    console.log('Conversation updated successfully');
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
