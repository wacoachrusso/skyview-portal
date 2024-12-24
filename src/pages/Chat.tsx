import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatList } from "@/components/chat/ChatList";
import { Message, Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUserId(user.id);
      
      // Load initial messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
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
  }, [navigate]);

  const handleSendMessage = async (content: string) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content,
            user_id: currentUserId,
            role: 'user',
            conversation_id: '123' // You might want to make this dynamic
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically add the message to the UI
      if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-brand-navy to-brand-slate">
      <header className="flex items-center gap-4 p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Chat</h1>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <ChatList 
          messages={messages} 
          currentUserId={currentUserId || ''} 
        />
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}