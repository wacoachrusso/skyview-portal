import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatList } from "@/components/chat/ChatList";
import { Message } from "@/types/chat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = async (userId: string) => {
    console.log('Creating new conversation for user:', userId);
    try {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        throw conversationError;
      }
      
      console.log('New conversation created:', newConversation);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      
      return newConversation.id;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  };

  const handleNewChat = async () => {
    if (!currentUserId) {
      console.error('No current user ID available for new chat');
      return;
    }
    await createNewConversation(currentUserId);
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }
      console.log('User authenticated:', user.id);
      setCurrentUserId(user.id);
      
      await createNewConversation(user.id);
    };

    checkAuth();

    console.log('Setting up real-time subscription...');
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          if (newMessage.conversation_id === currentConversationId) {
            console.log('Adding message to chat:', newMessage);
            setMessages(prev => [...prev, newMessage]);
          } else {
            console.log('Message not for current conversation, ignoring');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [navigate, currentConversationId]);

  const handleSendMessage = async (content: string) => {
    console.log('handleSendMessage called with content:', content);
    
    if (!currentUserId || !currentConversationId) {
      console.error('No user ID or conversation ID available', { currentUserId, currentConversationId });
      return;
    }
    
    console.log('Sending message:', { content, conversationId: currentConversationId });
    setIsLoading(true);
    
    try {
      // Update conversation's last_message_at
      console.log('Updating conversation last_message_at');
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentConversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        throw updateError;
      }

      // Save user message
      console.log('Saving user message to database...');
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: currentConversationId
          }
        ])
        .select()
        .single();

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
        throw userMessageError;
      }

      console.log('User message saved:', userMessage);

      // Get AI response using Supabase Edge Function
      console.log('Calling AI completion function...');
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { content }
      });

      if (error) {
        console.error('Error from AI completion:', error);
        throw error;
      }

      console.log('AI response received:', data);

      // Save AI response
      console.log('Saving AI response to database...');
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content: data.response,
            user_id: null,
            role: 'assistant',
            conversation_id: currentConversationId
          }
        ]);

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
        throw aiMessageError;
      }

    } catch (error) {
      console.error('Error in chat flow:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <ChatHeader onBack={() => navigate('/')} onNewChat={handleNewChat} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <p className="text-lg">Ask me anything about your contract and I'll help you understand it...</p>
              </div>
            )}
            <ChatList 
              messages={messages} 
              currentUserId={currentUserId || ''} 
            />
          </div>
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}