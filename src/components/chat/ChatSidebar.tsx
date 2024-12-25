import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatSettings } from "./ChatSettings";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { format } from "date-fns";

interface ChatSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export function ChatSidebar({ onSelectConversation, currentConversationId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      console.log('Loading conversations...');
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      console.log('Loaded conversations:', data);
      setConversations(data || []);
    };

    loadConversations();

    // Subscribe to new conversations
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
          console.log('Conversation change received:', payload);
          loadConversations(); // Reload conversations when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-gradient-to-b from-[#1A1F2C] to-[#2A2F3C] border-r border-white/10 flex flex-col">
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#1E1E2E] to-[#2A2F3C]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-base">S</span>
          </div>
          <span className="text-white font-semibold text-sm sm:text-base">SkyGuide</span>
        </div>
        <ChatSettings />
      </div>
      
      <div className="p-3 sm:p-4 border-b border-white/10 bg-gradient-to-b from-[#1E1E2E] to-[#2A2F3C]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-8 sm:pl-10 text-sm sm:text-base bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#2A2F3C] to-[#1A1F2C] p-2">
        {filteredConversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant="ghost"
            className={`w-full justify-start text-left mb-1 ${
              currentConversationId === conversation.id
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="truncate">
              <div className="font-medium text-white">{conversation.title}</div>
              <div className="text-xs text-gray-400">
                {format(new Date(conversation.last_message_at), 'MMM d, yyyy')}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}