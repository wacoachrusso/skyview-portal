import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/hooks/use-toast";
import { loadConversationMessages } from "@/utils/conversationUtils";
import { useNavigate } from "react-router-dom";
import {
  DeleteConfirmationDialog,
  OfflineAlert,
  TrialEndedState,
} from "@/chat/StatusAlerts";
import { ChatLayout } from "@/chat/ChatLayout";
import ChatHeader from "@/chat/ChatHeader";
import ChatContainer from "@/chat/ChatContainer";
import ChatInput from "@/chat/ChatInput";
import { Message } from "@/types/chat";
import { handleSendMessage } from "@/services/chatService/sendMessage";

export default function Chat() {
  const { isOffline } = useOfflineStatus();
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mounted = useRef(true);

  // State variables
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);

  // Session check and user data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && mounted.current) {
        setIsLoading(false);
      }
    }, 1500);

    checkSession();

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        navigate("/login");
        return;
      }

      if (mounted.current) {
        setUserEmail(session.user.email || "");

        if (profile.full_name && profile.full_name.trim() !== "") {
          setUserName(profile.full_name);
        } else {
          setUserName("");
        }

        setCurrentUserId(session.user.id);
        setIsAdmin(profile.is_admin || false);
        setQueryCount(profile.query_count || 0);
        setUserProfile(profile);

        loadUserConversations(session.user.id);
      }
    } catch (error) {
      console.error("Error in checkSession:", error);
      if (mounted.current) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "There was a problem loading your dashboard. Please try again.",
        });
        navigate("/login");
      }
    }
  };

  // Load user conversations after user data is loaded
  const loadUserConversations = async (userId) => {
    try {
      setIsFetchingConversations(true);
      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (mounted.current) {
        setConversations(conversationsData || []);

        if (conversationsData && conversationsData.length > 0) {
          const conversationId = conversationsData[0].id;
          setCurrentConversationId(conversationId);

          const conversationMessages = await loadConversationMessages(
            conversationId
          );
          setMessages(conversationMessages || []);
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
      setIsFetchingConversations(false);
    }
  };

  // Message sending handler
  const onSendMessage = async (content) => {
    await handleSendMessage({
      content,
      currentUserId,
      currentConversationId,
      setMessages,
      setCurrentConversationId,
      setIsLoading,
      setConversations,
      setQueryCount,
      toast,
    });
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      setIsLoading(true);

      // Delete the conversation from the database
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      // Update the conversations list
      setConversations((prev) =>
        prev.filter((convo) => convo.id !== conversationId)
      );

      // If the deleted conversation was the current one, clear messages and set current ID to null
      if (conversationId === currentConversationId) {
        setMessages([]);
        setCurrentConversationId(null);

        // If there are other conversations, select the first one
        if (conversations.length > 1) {
          const nextConversation = conversations.find(
            (convo) => convo.id !== conversationId
          );
          if (nextConversation) {
            setCurrentConversationId(nextConversation.id);
            const nextMessages = await loadConversationMessages(
              nextConversation.id
            );

            // Transform the messages to match the Message type
            const transformedMessages = (nextMessages || []).map((msg) => ({
              ...msg,
              role:
                msg.role === "user" || msg.role === "assistant"
                  ? msg.role
                  : msg.role === "system"
                  ? "assistant"
                  : "user",
            })) as Message[];

            setMessages(transformedMessages);
          }
        }
      }

      toast({
        title: "Success",
        description: "Conversation deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmationId(null);
    }
  };

  // Start a new chat
  const startNewChat = async () => {
    setIsLoading(true);
    setMessages([]);
    setCurrentConversationId(null);

    try {
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: currentUserId,
            title: "New conversation",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentConversationId(newConversation.id);
      setConversations((prev) => [newConversation, ...prev]);
    } catch (error) {
      console.error("Error creating new conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all conversations
  const handleDeleteAllConversations = async () => {
    try {
      setIsLoading(true);

      // Delete all user's conversations from the database
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", currentUserId);

      if (error) throw error;

      // Clear state
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);

      toast({
        title: "Success",
        description: "All conversations deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting all conversations:", error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content) => {
    copyToClipboard(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };

  const handleSelectConversation = async (conversationId) => {
    if (conversationId === currentConversationId) {
      setIsSidebarOpen(false);
      return;
    }

    setIsLoading(true);
    setMessages([]);

    try {
      const conversationMessages = await loadConversationMessages(
        conversationId
      );

      // Transform the messages to match the Message type
      const transformedMessages = (conversationMessages || []).map((msg) => ({
        ...msg,
        role:
          msg.role === "user" || msg.role === "assistant"
            ? msg.role
            : msg.role === "system"
            ? "assistant"
            : "user",
      })) as Message[];

      setMessages(transformedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
      setIsSidebarOpen(false);
    }
  };

  // Free plan limitation
  const isFreeTrialExhausted =
    userProfile?.subscription_plan === "free" && (queryCount || 0) >= 2;
  // : isFreeTrialExhausted ? (
  //   <TrialEndedState />
  // )
  return (
    <ChatLayout
    isSidebarOpen={isSidebarOpen}
    setIsSidebarOpen={setIsSidebarOpen}
    conversations={conversations}
    currentConversationId={currentConversationId}
    onSelectConversation={handleSelectConversation}
    onDeleteConversation={handleDeleteConversation}
    onDeleteAllConversations={handleDeleteAllConversations}
    isLoading={isFetchingConversations}
  >
    {/* Main content area */}
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Top navigation bar - fixed at top */}
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userName={userName}
        startNewChat={startNewChat}
      />

      {/* Main content area with chat messages */}
      <div className="flex flex-col h-full relative">
        {isOffline ? (
          <OfflineAlert />
        ) : (
          <>
            {/* Chat messages - scrollable area */}
            <div className="absolute inset-0 bottom-24 pt-2">
              <ChatContainer
                messages={messages}
                currentUserId={currentUserId || ""}
                isLoading={isLoading}
                onCopyMessage={handleCopyMessage}
                onSelectQuestion={setSelectedQuestion}
              />
            </div>

            {/* Chat input area - fixed at bottom with proper space */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <ChatInput
                onSendMessage={onSendMessage}
                isLoading={isLoading}
                queryCount={queryCount}
                subscriptionPlan={userProfile?.subscription_plan}
                selectedQuestion={selectedQuestion}
              />
            </div>
          </>
        )}
      </div>
    </div>

    {/* Confirmation Dialog for single conversation deletion */}
    {deleteConfirmationId && (
      <DeleteConfirmationDialog
        conversationId={deleteConfirmationId}
        onCancel={() => setDeleteConfirmationId(null)}
        onDelete={handleDeleteConversation}
      />
    )}
  </ChatLayout>
  );
}
