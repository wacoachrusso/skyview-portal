import { useEffect, useState } from "react";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConversationList } from "./sidebar/ConversationList";
import { SearchBar } from "./sidebar/SearchBar";
import { SidebarHeader } from "./sidebar/SidebarHeader";

interface ChatSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatSidebar({ currentConversationId, onSelectConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadConversations = async () => {
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
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
      return;
    }

    setConversations(prev => prev.filter(convo => convo.id !== conversationId));
  };

  const deleteAllConversations = async () => {
    const { error } = await supabase
      .from('conversations')
      .delete();

    if (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations.",
        variant: "destructive",
      });
      return;
    }

    setConversations([]);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-[#1A1F2C] border-r border-white/10 flex flex-col h-full">
      <SidebarHeader onDeleteAll={deleteAllConversations} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
