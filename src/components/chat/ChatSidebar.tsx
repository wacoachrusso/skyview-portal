import { useEffect, useState } from "react";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConversationList } from "./sidebar/ConversationList";
import { SearchBar } from "./sidebar/SearchBar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChatSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatSidebar({ currentConversationId, onSelectConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const CHAT_LIMIT_WARNING = 25;

  const loadConversations = async () => {
    console.log('Loading conversations...');
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
      return;
    }

    setConversations(data);
    console.log('Loaded conversations:', data.length);

    // Show warning if exceeding chat limit
    if (data.length >= CHAT_LIMIT_WARNING) {
      toast({
        title: "Chat History Notice",
        description: "You have quite a few chats saved. Consider deleting old ones to keep things organized.",
        duration: 5000,
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      setConversations(prev => prev.filter(convo => convo.id !== conversationId));
      
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });

      console.log('Conversation deleted:', conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const deleteAllConversations = async () => {
    try {
      // Get all conversation IDs for the current user
      const { data: userConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id');

      if (fetchError) throw fetchError;

      if (!userConversations || userConversations.length === 0) {
        toast({
          title: "Info",
          description: "No conversations to delete.",
        });
        return;
      }

      const conversationIds = userConversations.map(conv => conv.id);

      // First delete all messages in these conversations
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) throw messagesError;

      // Then delete all conversations
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .in('id', conversationIds);

      if (conversationsError) throw conversationsError;

      setConversations([]);
      
      toast({
        title: "Success",
        description: "All conversations deleted successfully",
      });

      console.log('All conversations deleted');
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations.",
        variant: "destructive",
      });
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Set up real-time subscription for conversations
  useEffect(() => {
    console.log('Setting up real-time subscription for conversations...');
    const channel = supabase
      .channel('conversations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation change detected:', payload);
          loadConversations(); // Reload all conversations when any change occurs
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up conversations subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-[#1A1F2C] border-r border-white/10 flex flex-col h-full">
      <SidebarHeader onDeleteAll={deleteAllConversations} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {conversations.length >= CHAT_LIMIT_WARNING && (
        <Alert variant="warning" className="mx-2 my-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {conversations.length} chats. Consider deleting old ones to keep things organized.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>
    </div>
  );
}