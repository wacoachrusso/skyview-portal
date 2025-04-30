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
import {
  DeleteConfirmationDialog,
  OfflineAlert,
  TrialEndedState,
} from "@/components/chat/StatusAlerts";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import { createNewChat } from "@/services/chatService/createNewChat";

export default function Chat() {
  const { isOffline } = useOfflineStatus();
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mounted = useRef(true);
  const hasCheckedSession = useRef(false);
  const sessionCheckInProgress = useRef(false);
  const profileRequestFailed = useRef(false);

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

    // Only check session once
    if (!hasCheckedSession.current) {
      checkSession();
      hasCheckedSession.current = true;
    }

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

const checkSession = async () => {
  // Prevent multiple calls during token refresh
  if (sessionCheckInProgress.current) {
    console.log(
      "Session check already in progress, skipping redundant check"
    );
    return;
  }

  // Check if auth is stabilizing (just after payment/login)
  const isStabilizing = localStorage.getItem("auth_stabilizing") === "true";
  if (isStabilizing) {
    console.log("Auth stabilizing, delaying session checks");
    setTimeout(() => {
      sessionCheckInProgress.current = false;
      checkSession();
    }, 2000);
    return;
  }

  sessionCheckInProgress.current = true;

  try {
    // Check if there's a pending refresh to avoid race conditions
    let pendingRefresh = localStorage.getItem("auth_refresh_in_progress") === "true";
    if (pendingRefresh) {
      console.log("Auth refresh in progress, waiting before session check");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error detected:", sessionError);
      throw sessionError;
    }

    if (!session) {
      console.log("No active session found, redirecting to login");
      
      // Clear any potentially corrupted auth state
      await supabase.auth.signOut();
      localStorage.removeItem("auth_access_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      
      navigate("/login");
      return;
    }

    // Before making profile request, check if we recently got a 401
    if (profileRequestFailed.current) {
      console.log(
        "Recent profile request failed with 401, refreshing token before retry"
      );
      
      // Mark refresh in progress to prevent race conditions
      localStorage.setItem("auth_refresh_in_progress", "true");
      
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        
        // Wait a moment for the refresh to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        profileRequestFailed.current = false;
      } catch (refreshErr) {
        console.error("Error during session refresh:", refreshErr);
        handleSessionError("Session expired. Please log in again.");
        return;
      } finally {
        localStorage.removeItem("auth_refresh_in_progress");
      }
    }

    const profileRequest = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    const { data: profile, error: profileError, status } = profileRequest;

    if (status === 401) {
      console.log(
        "401 Unauthorized error on profile request, token may need refresh"
      );
      profileRequestFailed.current = true;

      // Try to refresh the token before navigating away
      try {
        console.log("Attempting session refresh");
        localStorage.setItem("auth_refresh_in_progress", "true");
        
        const { error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError) {
          console.log(
            "Session refreshed successfully, restarting session check"
          );
          // Reset the flag and restart the check after a brief delay
          localStorage.removeItem("auth_refresh_in_progress");
          sessionCheckInProgress.current = false;
          setTimeout(() => checkSession(), 1000);
          return;
        } else {
          localStorage.removeItem("auth_refresh_in_progress");
          console.error("Session refresh failed:", refreshError);
          throw refreshError;
        }
      } catch (refreshErr) {
        localStorage.removeItem("auth_refresh_in_progress");
        console.error("Error during session refresh:", refreshErr);
        handleSessionError("Session expired. Please log in again.");
        return;
      }
    }

    if (profileError) {
      console.error("Profile error:", profileError);
      throw profileError;
    }

    if (!profile) {
      console.log("No profile found, redirecting to login");
      navigate("/login");
      return;
    }

    // Check if user has inactive subscription - avoid redirect loop by checking localStorage flag
    const needsPricingRedirect =
      ((profile.subscription_plan === "free" &&
        (profile.query_count || 0) >= 2) ||
        (profile.subscription_status === "inactive" &&
          profile.subscription_plan !== "free")) &&
      !localStorage.getItem("redirect_to_pricing");

    if (needsPricingRedirect) {
      // Set flag to prevent redirect loops
      localStorage.setItem("redirect_to_pricing", "true");

      // Redirect to pricing section
      navigate("/?scrollTo=pricing-section", { replace: true });

      // Clear the flag after a delay
      setTimeout(() => {
        localStorage.removeItem("redirect_to_pricing");
      }, 5000);

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
      
      // Update localStorage with auth state for debugging
      localStorage.setItem("chat_auth_checked", "true");
      localStorage.setItem("last_chat_auth_check", new Date().toISOString());
    }
  } catch (error) {
    console.error("Error in checkSession:", error);
    handleSessionError(
      "There was a problem loading your dashboard. Please try again."
    );
  } finally {
    sessionCheckInProgress.current = false;
  }
};
  // New helper function to handle session errors
  const handleSessionError = (message) => {
    if (mounted.current) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: message,
      });
      navigate("/login");
    }
  };

  // Load user conversations after user data is loaded
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
        console.log(
          "401 error loading conversations, attempting session refresh"
        );
        const { error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError) {
          // Retry after refresh
          const { data: retryData, error: retryError } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (retryError) throw retryError;
          if (mounted.current && retryData) {
            setConversations(retryData);
            handleFirstConversation(retryData);
          }
        } else {
          throw new Error("Session refresh failed");
        }
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
    currentUserId,
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

  // Redirect to pricing section
  const handleViewPricingPlans = () => {
    navigate("/?scrollTo=pricing-section", { replace: true });
  };

  // Free plan limitation
  const isFreeTrialExhausted =
    userProfile?.subscription_plan === "free" && (queryCount || 0) >= 2;

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
          ) : isFreeTrialExhausted ? (
            <TrialEndedState onViewPricingPlans={handleViewPricingPlans} />
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
