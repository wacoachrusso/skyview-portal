import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageOperations } from "./useMessageOperations";
import { useUserProfile } from "./useUserProfile";
import { Message } from "@/types/chat";

export function useChat() {
  const { toast } = useToast();
  const { currentUserId, userProfile } = useUserProfile();
  const {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId,
  } = useConversation();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages,
  } = useMessageOperations(currentUserId, currentConversationId);

  const activeChannelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Get a stable channel name
  const getChannelName = useCallback((conversationId: string) => {
    return `messages_${conversationId}`;
  }, []);

  // Function to setup a channel subscription with reconnection logic
  const setupChannel = useCallback(
    (conversationId: string) => {
      if (!conversationId || !isMountedRef.current) return;

      // Clean up existing channel
      if (activeChannelRef.current) {
        console.log(`Removing existing channel: ${activeChannelRef.current}`);
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }

      const channelName = getChannelName(conversationId);
      console.log(`Setting up new channel: ${channelName} for conversation: ${conversationId}`);

      const channel = supabase
        .channel(channelName, {
          config: {
            // Add any necessary configuration here
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (!isMountedRef.current) return;

            console.log("Received payload:", payload); // Log the full payload

            if (!payload?.new) {
              console.warn("Received payload without 'new' data:", payload);
              return;
            }

            const newMessage = payload.new as Message;
            console.log(`Received new message: ${newMessage.id}`);

            // Check for duplicates before adding to state
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === newMessage.id);
              return exists ? prev : [...prev, newMessage];
            });
          }
        )
        .on("system", { event: "disconnect" }, () => {
          console.log("WebSocket disconnected. Attempting to reconnect...");
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (isMountedRef.current) {
              setupChannel(conversationId);
            }
          }, 5000); // Reconnect after 5 seconds
        })
        .on("system", { event: "connected" }, () => {
          console.log("WebSocket connected successfully.");
        })
        .subscribe((status, err) => {
          console.log(`Channel ${channelName} status: ${status}`);
          if (err) {
            console.error(`Subscription error:`, err);
            // Attempt to reconnect on error
            setTimeout(() => {
              if (isMountedRef.current) {
                setupChannel(conversationId);
              }
            }, 5000); // Reconnect after 5 seconds
          }
        });

      activeChannelRef.current = channel;
    },
    [getChannelName, setMessages]
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Unable to send message. Please try refreshing the page.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      if (isLoading) {
        console.log("Message sending is already in progress.");
        return;
      }

      setIsLoading(true);
      console.log("Sending message...");

      let tempMessage: Message | null = null;

      try {
        // Create a temporary message for optimistic update
        tempMessage = {
          id: crypto.randomUUID(), // Generate a temporary ID
          conversation_id: currentConversationId || "",
          user_id: currentUserId,
          content: content,
          role: "user",
          created_at: new Date().toISOString(),
        };

        // Add the temporary message to the state
        setMessages((prev) => {
          console.log("Adding temporary message:", tempMessage);
          return [...prev, tempMessage];
        });

        // Ensure the conversation exists
        const conversationId = await ensureConversation(currentUserId, content);
        if (!conversationId) {
          throw new Error("Failed to create or get conversation");
        }

        // Insert the user message into the database
        await insertUserMessage(content, conversationId);
        console.log("User message inserted.");

        // Call the AI completion function
        const { data, error } = await supabase.functions.invoke("chat-completion", {
          body: {
            content: `${content}`,
            subscriptionPlan: userProfile?.subscription_plan || "free",
            assistantId: userProfile?.assistant_id || "default_assistant_id",
          },
        });

        if (error) {
          console.error("AI completion error:", error);
          throw error;
        }

        if (!data || !data.response) {
          console.error("Invalid response from AI completion:", data);
          throw new Error("Invalid response from chat-completion");
        }

        // Insert the AI response
        await insertAIMessage(data.response, conversationId);
        console.log("AI message inserted.");
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
          duration: 2000,
        });

        // Remove the temporary message if an error occurs
        if (tempMessage) {
          setMessages((prev) => {
            console.log("Removing temporary message due to error:", tempMessage);
            return prev.filter((msg) => msg.id !== tempMessage!.id);
          });
        }
      } finally {
        setIsLoading(false);
        console.log("Message sending completed.");
      }
    },
    [
      currentUserId,
      ensureConversation,
      insertUserMessage,
      insertAIMessage,
      userProfile,
      toast,
      isLoading,
      currentConversationId,
      setMessages,
    ]
  );

  // Start a new chat
  const startNewChat = useCallback(async () => {
    try {
      setMessages([]);
      setIsLoading(false);
      setCurrentConversationId(null);

      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        if (newConversationId) {
          setCurrentConversationId(newConversationId);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new chat. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [createNewConversation, currentUserId, setCurrentConversationId, setMessages, setIsLoading, toast]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, loadMessages]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (currentConversationId) {
      setupChannel(currentConversationId);
    }
  }, [currentConversationId, setupChannel]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeChannelRef.current) {
        console.log(`Cleaning up channel on unmount: ${activeChannelRef.current}`);
        supabase.removeChannel(activeChannelRef.current);
        activeChannelRef.current = null;
      }
    };
  }, []);

  return {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    userProfile,
    startNewChat,
  };
}