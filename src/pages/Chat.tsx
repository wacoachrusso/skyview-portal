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
import { Subscription } from "@/types/subscription";
import { useAuthStore } from "@/stores/authStores";
import chalk from "chalk";

/**
 * CHAT COMPONENT DOCUMENTATION
 * ============================
 * 
 * Purpose: Main chat interface component that handles user conversations, messaging, and subscription management
 * 
 * Key Responsibilities:
 * 1. Authentication and session management
 * 2. Loading and managing user conversations
 * 3. Real-time messaging functionality
 * 4. Subscription plan validation and free trial limits
 * 5. Role-based chat experience (Line Holder vs Reserve)
 * 6. Offline status handling
 * 7. Message operations (send, copy, delete)
 * 8. Conversation management (create, delete, select)
 * 
 * State Management:
 * - User authentication via useAuthStore
 * - Local state for conversations, messages, and UI controls
 * - Subscription data for plan validation
 * - Role type management for different user experiences
 * 
 * Data Flow:
 * 1. Component mounts → Check auth status
 * 2. Load user profile → Fetch conversations and subscription data
 * 3. Select conversation → Load messages
 * 4. Send message → Validate limits → Update conversation
 * 5. Manage subscription limits → Show trial ended state or allow messaging
 * 
 * Integration Points:
 * - Supabase for data persistence
 * - Auth store for user management
 * - Chat service for message handling
 * - Navigation for routing
 * - Toast notifications for user feedback
 */

export default function Chat() {
  console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 1: Component initialization started`));
  
  const { isOffline } = useOfflineStatus();
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mounted = useRef(true);
  const { 
    authUser, 
    profile, 
    isLoading:isProfileLoading, 
    refreshProfile,
    logout: storeLogout,
    profileError,
    queryCount,
    setQueryCount
  } = useAuthStore();

  console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 2: Auth state retrieved → User: ${authUser?.id || 'none'}, Profile Loading: ${isProfileLoading}`));

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
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  
  console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 3: State variables initialized → Conversations: ${conversations.length}, Messages: ${messages.length}`));
  
  // Redirect to login if profile fails to load
  useEffect(() => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 4: Profile validation effect → Loading: ${isProfileLoading}, Error: ${!!profileError}, User: ${!!authUser}`));
    
    if (!isProfileLoading && (profileError || !authUser)) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 4a: Authentication failed → Redirecting to login`));
      navigate("/login");
    }
  }, [isProfileLoading, profileError, authUser, navigate]);

  // Load user conversations and subscription data after profile is loaded
  useEffect(() => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 5: User data loading effect → Profile Loading: ${isProfileLoading}, User ID: ${authUser?.id || 'none'}`));
    
    if (!isProfileLoading && authUser?.id) {
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 5a: Starting user data load → User ID: ${authUser.id}`));
      loadUserConversations(authUser.id);
      getSubscriptionData();
      
      // Set initial role type from profile
      if (profile?.role_type) {
        console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 5b: Setting role type from profile → Role: ${profile.role_type}`));
        setCurrentRoleType(profile.role_type as 'Line Holder' | 'Reserve');
      }
    }
  }, [isProfileLoading, authUser, profile?.role_type]);

  // Fetch subscription data when profile changes
  useEffect(() => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 6: Subscription data effect → Profile ID: ${profile?.id || 'none'}`));
    
    if (profile?.id) {
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 6a: Fetching subscription data → Profile ID: ${profile.id}`));
      getSubscriptionData();
    }
  }, [profile?.id]);

  // Cleanup on unmount
  useEffect(() => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 7: Cleanup effect registered`));
    
    return () => {
      console.log(chalk.bgYellow.black.bold(`[Chat] Step 7a: Component unmounting → Setting mounted to false`));
      mounted.current = false;
    };
  }, []);

  // Check if free trial is exhausted using subscription data
  useEffect(() => {
    const currentPlan = subscriptionData[0]?.plan || "free";
    const freeTrialExhausted = currentPlan === "free" && (queryCount || 0) >= 2;
    
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 8: Trial validation effect → Plan: ${currentPlan}, Query Count: ${queryCount || 0}, Trial Exhausted: ${freeTrialExhausted}`));
    
    if (!isLoading) {
      if (freeTrialExhausted) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 8a: Free trial exhausted → Setting trial ended state`));
        setIsTrialEnded(true);
      } else {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 8b: User is in premium plan, so no free trial implied`));
        setIsTrialEnded(false);
      }
    }
    
  }, [queryCount, subscriptionData, isLoading]);

  // Get subscription data from subscriptions table
  const getSubscriptionData = async () => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 9: Getting subscription data → Profile ID: ${profile?.id || 'none'}`));
    
    if (profile?.id) {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });
          
        if (error) {
          console.log(chalk.bgRed.white.bold(`[Chat] Step 9a: Subscription fetch error → ${error.message}`));
          console.error("Error fetching subscription by user_id:", error);
        } else {
          console.log(chalk.bgGreen.black.bold(`[Chat] Step 9b: Subscription data retrieved → Count: ${data?.length || 0}, Current Plan: ${data?.[0]?.plan || 'none'}`));
          setSubscriptionData(data || []);
        }
      } catch (err) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 9c: Subscription fetch exception → ${err}`));
      }
    }
  };

  // Handle role change
  const handleRoleChange = (newRole: 'Line Holder' | 'Reserve') => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 10: Role change initiated → From: ${currentRoleType} To: ${newRole}`));
    
    setCurrentRoleType(newRole);
    
    // Optionally refresh profile to get updated data
    if (refreshProfile) {
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 10a: Refreshing profile after role change`));
      refreshProfile();
    }
  };

  // Load user conversations
  const loadUserConversations = async (userId) => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 11: Loading conversations → User ID: ${userId}`));
    
    try {
      setIsFetchingConversations(true);
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 11a: Fetching conversations from database`));

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
        console.log(chalk.bgRed.white.bold(`[Chat] Step 11b: 401 error loading conversations → Redirecting to login`));
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Your session has expired. Please log in again.",
        });
        navigate("/login");
        return;
      }

      if (error) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 11c: Conversation fetch error → ${error.message}`));
        throw error;
      }

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 11d: Conversations loaded successfully → Count: ${conversationsData?.length || 0}`));

      if (mounted.current) {
        setConversations(conversationsData || []);
        handleFirstConversation(conversationsData);
      }
    } catch (err) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 11e: Conversation loading exception → ${err}`));
      console.error("Error loading conversations:", err);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      if (mounted.current) {
        console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 11f: Conversation loading completed → Setting loading to false`));
        setIsLoading(false);
      }
      setIsFetchingConversations(false);
    }
  };

  // Helper function to handle the first conversation
  const handleFirstConversation = async (conversationsData) => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 12: Handling first conversation → Available: ${conversationsData?.length || 0}`));
    
    if (conversationsData && conversationsData.length > 0) {
      const conversationId = conversationsData[0].id;
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 12a: Setting current conversation → ID: ${conversationId}`));
      setCurrentConversationId(conversationId);

      try {
        console.log(chalk.bgGreen.black.bold(`[Chat] Step 12b: Loading messages for conversation → ID: ${conversationId}`));
        const conversationMessages = await loadConversationMessages(conversationId);
        
        if (mounted.current) {
          console.log(chalk.bgGreen.black.bold(`[Chat] Step 12c: Messages loaded successfully → Count: ${conversationMessages?.length || 0}`));
          setMessages(conversationMessages || []);
        }
      } catch (err) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 12d: Message loading error → ${err}`));
        console.error("Error loading messages:", err);
      }
    } else {
      console.log(chalk.bgYellow.black.bold(`[Chat] Step 12e: No conversations available → Starting fresh`));
    }
  };

  // Message sending handler
  const onSendMessage = async (content) => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 13: Message send initiated → Content Length: ${content?.length || 0}, User: ${authUser?.id || 'none'}`));
    
    if (!authUser?.id) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 13a: Send message failed → No authenticated user`));
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to send messages.",
      });
      return;
    }

    // Check if free trial is exhausted using subscription data
    const currentPlan = subscriptionData[0]?.plan || "free";
    const freeTrialExhausted = currentPlan === "free" && (queryCount || 0) >= 2;

    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 13b: Trial validation → Plan: ${currentPlan}, Query Count: ${queryCount || 0}, Exhausted: ${freeTrialExhausted}`));

    if (freeTrialExhausted) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 13c: Message blocked → Free trial exhausted`));
      toast({
        variant: "destructive",
        title: "Free Trial Ended",
        description: "You've reached your free message limit. Please upgrade to continue.",
      });
      return;
    }

    // Reset the trial ended indicator when sending a new message
    console.log(chalk.bgGreen.black.bold(`[Chat] Step 13d: Proceeding with message send → Resetting trial ended state`));
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
    
    console.log(chalk.bgGreen.black.bold(`[Chat] Step 13e: Message send completed`));
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 14: Deleting conversation → ID: ${conversationId}`));
    
    try {
      setIsLoading(true);
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 14a: Deleting conversation from database`));

      // Delete the conversation from the database
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 14b: Conversation deletion error → ${error.message}`));
        throw error;
      }

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 14c: Conversation deleted successfully → Updating state`));

      // Update the conversations list
      setConversations((prev) =>
        prev.filter((convo) => convo.id !== conversationId)
      );

      // If the deleted conversation was the current one, clear messages and set current ID to null
      if (conversationId === currentConversationId) {
        console.log(chalk.bgYellow.black.bold(`[Chat] Step 14d: Deleted conversation was current → Clearing messages`));
        setMessages([]);
        setCurrentConversationId(null);

        // If there are other conversations, select the first one
        if (conversations.length > 1) {
          const nextConversation = conversations.find(
            (convo) => convo.id !== conversationId
          );
          if (nextConversation) {
            console.log(chalk.bgGreen.black.bold(`[Chat] Step 14e: Selecting next conversation → ID: ${nextConversation.id}`));
            setCurrentConversationId(nextConversation.id);
            const nextMessages = await loadConversationMessages(nextConversation.id);

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

            console.log(chalk.bgGreen.black.bold(`[Chat] Step 14f: Next conversation messages loaded → Count: ${transformedMessages.length}`));
            setMessages(transformedMessages);
          }
        }
      }

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 14g: Conversation deletion completed successfully`));
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 14h: Conversation deletion exception → ${error}`));
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
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 15: Creating new conversation → User ID: ${userId}`));
    
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

      if (error) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 15a: New conversation creation error → ${error.message}`));
        throw error;
      }

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 15b: New conversation created → ID: ${newConversation.id}`));

      // Update conversations state
      setConversations((prev) => [newConversation, ...prev]);

      return newConversation.id;
    } catch (error) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 15c: New conversation creation exception → ${error}`));
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
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 16: Deleting all conversations → User ID: ${authUser?.id || 'none'}`));
    
    try {
      setIsLoading(true);
      console.log(chalk.bgGreen.black.bold(`[Chat] Step 16a: Deleting all conversations from database`));

      // Delete all user's conversations from the database
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", authUser?.id);

      if (error) {
        console.log(chalk.bgRed.white.bold(`[Chat] Step 16b: Delete all conversations error → ${error.message}`));
        throw error;
      }

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 16c: All conversations deleted → Clearing state`));

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
      console.log(chalk.bgRed.white.bold(`[Chat] Step 16d: Delete all conversations exception → ${error}`));
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
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 17: Copying message → Content Length: ${content?.length || 0}`));
    
    copyToClipboard(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };

  const handleSelectConversation = async (conversationId) => {
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 18: Selecting conversation → ID: ${conversationId}, Current: ${currentConversationId}`));
    
    if (conversationId === currentConversationId) {
      console.log(chalk.bgYellow.black.bold(`[Chat] Step 18a: Same conversation selected → Closing sidebar`));
      setIsSidebarOpen(false);
      return;
    }

    setIsLoading(true);
    setMessages([]);
    console.log(chalk.bgGreen.black.bold(`[Chat] Step 18b: Loading new conversation messages`));

    try {
      const conversationMessages = await loadConversationMessages(conversationId);

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

      console.log(chalk.bgGreen.black.bold(`[Chat] Step 18c: Conversation messages loaded → Count: ${transformedMessages.length}`));
      setMessages(transformedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.log(chalk.bgRed.white.bold(`[Chat] Step 18d: Conversation selection error → ${error}`));
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
    console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 19: Redirecting to pricing plans`));
    navigate("/?scrollTo=pricing-section", { replace: true });
  };

  // Get current plan from subscription data
  const currentPlan = subscriptionData[0]?.plan || "free";
  console.log(chalk.bgBlueBright.black.bold(`[Chat] Step 20: Rendering component → Current Plan: ${currentPlan}, Trial Ended: ${isTrialEnded}, Offline: ${isOffline}`));

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
                    subscriptionPlan={currentPlan}
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