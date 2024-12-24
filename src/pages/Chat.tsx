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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUserId(user.id);
      
      // Create or get latest conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      let conversationId: string;
      
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive"
          });
          return;
        }
        
        conversationId = newConversation.id;
      }
      
      setCurrentConversationId(conversationId);

      // Load messages for this conversation
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messages) {
        setMessages(messages);
      }
    };

    checkAuth();

    // Subscribe to new messages
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
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);

  const handleSendMessage = async (content: string) => {
    if (!currentUserId || !currentConversationId) return;
    
    setIsLoading(true);
    try {
      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentConversationId);

      // Save user message
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

      if (userMessageError) throw userMessageError;

      // Get AI response using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { content }
      });

      if (error) throw error;

      // Save AI response with NULL user_id
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([
          {
            content: data.response,
            user_id: null, // Using NULL for AI messages
            role: 'assistant',
            conversation_id: currentConversationId
          }
        ]);

      if (aiMessageError) throw aiMessageError;

    } catch (error) {
      console.error('Error in chat:', error);
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
        <ChatHeader onBack={() => navigate('/')} />
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