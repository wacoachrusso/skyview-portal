import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMessageHandling = (currentUserId: string | null, currentConversationId: string | null) => {
  const { toast } = useToast();

  const updateConversation = async (conversationId: string, content: string) => {
    console.log('Updating conversation:', { conversationId, content });
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        title: content.slice(0, 50)
      })
      .eq('id', conversationId);

    if (updateError) throw updateError;
  };

  const insertUserMessage = async (content: string, conversationId: string) => {
    console.log('Inserting user message:', { content, conversationId });
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
    return userMessage;
  };

  const insertAIMessage = async (content: string, conversationId: string) => {
    console.log('Inserting AI message:', { conversationId });
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
  };

  return {
    updateConversation,
    insertUserMessage,
    insertAIMessage
  };
};