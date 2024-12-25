import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatSettings } from "./ChatSettings";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export function ChatSidebar({ onSelectConversation, currentConversationId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

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

  useEffect(() => {
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

  const deleteConversation = async (conversationId: string) => {
    console.log('Deleting conversation:', conversationId);
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Conversation deleted",
    });

    // If the deleted conversation was selected, clear the selection
    if (currentConversationId === conversationId) {
      onSelectConversation('');
    }
  };

  const deleteAllConversations = async () => {
    console.log('Deleting all conversations...');
    // Delete all conversations without using a placeholder comparison
    const { error } = await supabase
      .from('conversations')
      .delete()
      .not('id', 'is', null); // This will match all conversations since id is non-nullable

    if (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "All conversations deleted",
    });
    
    // Clear the current selection
    onSelectConversation('');
  };

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
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1E1E2E] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Clear All Conversations</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete all your conversations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={deleteAllConversations}
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ChatSettings />
        </div>
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
          <div
            key={conversation.id}
            className={`flex items-center gap-2 mb-1 rounded-lg ${
              currentConversationId === conversation.id
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
          >
            <Button
              variant="ghost"
              className="flex-1 justify-start text-left p-3"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="truncate">
                <div className="font-medium text-white">{conversation.title}</div>
                <div className="text-xs text-gray-400">
                  {format(new Date(conversation.last_message_at), 'MMM d, yyyy')}
                </div>
              </div>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1E1E2E] border border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Conversation</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete this conversation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteConversation(conversation.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}