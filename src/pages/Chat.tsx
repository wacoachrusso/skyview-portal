import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/hooks/use-toast";
import { loadConversationMessages } from "@/utils/conversationUtils";
import { useNavigate, useLocation } from "react-router-dom";
import { Message } from "@/types/chat";
import { handleSendMessage } from "@/services/chatService/sendMessage";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeader";
// RoleToggle is now integrated into ChatInput
import {
  DeleteConfirmationDialog,
  OfflineAlert,
  TrialEndedState,
} from "@/components/chat/StatusAlerts";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import { createNewChat } from "@/services/chatService/createNewChat";
import { useProfile } from "@/components/utils/ProfileProvider";

export default function Chat() {
  const { isOffline } = useOfflineStatus();
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mounted = useRef(true);
  const {
    profile,
    authUser,
    userName,
    queryCount,
    setQueryCount,
    isLoading: isProfileLoading,
    loadError: profileError,
    refreshProfile, // Add this to refresh profile after role change
  } = useProfile();

  // State variables
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const [isTrialEnded, setIsTrialEnded] = useState(false);
  const [currentRoleType, setCurrentRoleType] = useState<'Line Holder' | 'Reserve'>('Line Holder');
  
  // Redirect to login if profile fails to load
  useEffect(() => {
    if (!isProfileLoading && (profileError || !authUser)) {
      navigate("/login");
    }
  }, [isProfileLoading, profileError, authUser, navigate]);

  // Load user conversations after profile is loaded
  useEffect(() => {
    if (!isProfileLoading && authUser?.id) {
      loadUserConversations(authUser.id);
      // Set initial role type from profile
      if (profile?.role_type) {
        setCurrentRoleType(profile.role_type as 'Line Holder' | 'Reserve');
      }
    }
  }, [isProfileLoading, authUser, profile?.role_type]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Check if free trial is exhausted
  useEffect(() => {
    const freeTrialExhausted = 
      profile?.subscription_plan === "free" && (queryCount || 0) >= 2;
    
    if (freeTrialExhausted && !isLoading) {
      setIsTrialEnded(true);
    }
  }, [queryCount, profile?.subscription_plan, isLoading]);

  // Handle role change
  const handleRoleChange = (newRole: 'Line Holder' | 'Reserve') => {
    setCurrentRoleType(newRole);
    // Optionally refresh profile to get updated data
    if (refreshProfile) {
      refreshProfile();
    }
  };

  // Load user conversations
  const loadUserConversations = async (userId) => {
    try {
      setIsFetchingConversations(true);

      const {
        data: conversationsData,
        error,
        status,
      } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Handle potential 401 error
      if (status === 401) {
        console.log("401 error loading conversations");
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Your session has expired. Please log in again.",
        });
        navigate("/login");
        return;
      }

      if (error) throw error;

      if (mounted.current) {
        setConversations(conversationsData || []);
        handleFirstConversation(conversationsData);
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

  // Helper function to handle the first conversation
  const handleFirstConversation = async (conversationsData) => {
    if (conversationsData && conversationsData.length > 0) {
      const conversationId = conversationsData[0].id;
      setCurrentConversationId(conversationId);

      try {
        const conversationMessages = await loadConversationMessages(
          conversationId
        );
        if (mounted.current) {
          setMessages(conversationMessages || []);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }
  };

  // Message sending handler
  const onSendMessage = async (content) => {
    if (!authUser?.id) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to send messages.",
      });
      return;
    }

    // Check if free trial is exhausted
    const freeTrialExhausted = 
      profile?.subscription_plan === "free" && (queryCount || 0) >= 2;

    if (freeTrialExhausted) {
      toast({
        variant: "destructive",
        title: "Free Trial Ended",
        description: "You've reached your free message limit. Please upgrade to continue.",
      });
      return;
    }

    // Reset the trial ended indicator when sending a new message
    setIsTrialEnded(false);
    
    await handleSendMessage({
      content,
      currentUserId: authUser.id,
      currentConversationId,
      setMessages,
      setCurrentConversationId,
      setIsLoading,
      setConversations,
      setQueryCount,
      toast,
      navigateToLogin: () => navigate("/login"),
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

  const createNewConversation = async (userId) => {
    try {
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: userId,
            title: "New conversation",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update conversations state
      setConversations((prev) => [newConversation, ...prev]);

      return newConversation.id;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      return null;
    }
  };

  // Start a new chat
  const { startNewChat } = createNewChat(
    authUser?.id,
    createNewConversation,
    setCurrentConversationId,
    setMessages,
    setIsLoading,
    toast
  );

  // Delete all conversations
  const handleDeleteAllConversations = async () => {
    try {
      setIsLoading(true);

      // Delete all user's conversations from the database
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", authUser?.id);

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

  // Redirect to pricing section
  const handleViewPricingPlans = () => {
    navigate("/?scrollTo=pricing-section", { replace: true });
  };

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
                  currentUserId={authUser?.id || ""}
                  isLoading={isLoading}
                  onCopyMessage={handleCopyMessage}
                  onSelectQuestion={setSelectedQuestion}
                />
              </div>

              {/* Chat input area - fixed at bottom with proper space */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                {isTrialEnded ? (
                  <div className="bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col items-center justify-center space-y-3 py-2">
                      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                        You've reached your free message limit. Upgrade to continue chatting.
                      </p>
                      <button
                        onClick={handleViewPricingPlans}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        View Pricing Plans
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatInput
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    queryCount={queryCount}
                    subscriptionPlan={profile?.subscription_plan}
                    selectedQuestion={selectedQuestion}
                    userId={authUser?.id}
                    initialRoleType={currentRoleType}
                    onRoleChange={handleRoleChange}
                  />
                )}
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