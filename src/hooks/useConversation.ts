import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useConversation() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const createNewConversation = async () => {
    console.log("Creating new conversation...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session");
        toast({
          title: "Error",
          description: "Please sign in to create a new chat",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { 
            user_id: session.user.id,
            title: 'New Chat',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        toast({
          title: "Error",
          description: "Failed to create new chat",
          variant: "destructive",
        });
        return null;
      }

      console.log("New conversation created:", data);
      return data.id;
    } catch (error) {
      console.error("Error in createNewConversation:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const loadConversation = async (conversationId: string) => {
    console.log("Loading conversation:", conversationId);
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error loading conversation:", error);
        throw error;
      }

      setCurrentConversationId(conversationId);
      return data;
    } catch (error) {
      console.error("Error in loadConversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      return [];
    }
  };

  const ensureConversation = async (userId: string) => {
    if (currentConversationId) return currentConversationId;
    
    const newId = await createNewConversation();
    return newId;
  };

  return {
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    loadConversation,
    ensureConversation,
  };
}