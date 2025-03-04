import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    messages,
    isLoading,
    sendMessage,
    currentUserId,
    startNewChat,
    userProfile,
  } = useChat();

  // Function to increment query count in Supabase
  const incrementQueryCount = async (userId: string) => {
    try {
      console.log("Incrementing query count for user:", userId);
  
      // Step 1: Fetch the current query count
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("query_count")
        .eq("id", userId)
        .single();
  
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }
  
      const newCount = (profile?.query_count || 0) + 1;
      console.log("New query count:", newCount);
  
      // Step 2: Update the query count
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ query_count: newCount })
        .match({ id: userId });
  
      if (updateError) {
        console.error("Update error details:", {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        throw updateError;
      }
  
      console.log("Query count updated successfully");
    } catch (error) {
      console.error("Error in incrementQueryCount:", error);
      
    }
  };
  // Check user access and subscription plan on component mount
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch user profile to check subscription plan and query count
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan, query_count")
        .eq("id", session.user.id)
        .single();

      if (profile?.subscription_plan === "free" && profile?.query_count >= 1) {
        console.log("Free trial ended, redirecting to pricing");
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
        navigate("/?scrollTo=pricing-section");
      }
    };

    checkAccess();
  }, [navigate, toast]);

  // Check query limit after each message is sent
  useEffect(() => {
    if (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 1) {
      console.log("Query limit reached, redirecting to pricing");
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000,
      });
      navigate("/?scrollTo=pricing-section");
    }
  }, [userProfile?.query_count, userProfile?.subscription_plan, navigate, toast]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      console.log("Loading conversation:", conversationId);
      await loadConversation(conversationId);
      setCurrentConversationId(conversationId);
      setIsSidebarOpen(false);
    },
    [loadConversation, setCurrentConversationId]
  );

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 1) {
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
        navigate("/?scrollTo=pricing-section");
        return;
      }

      await sendMessage(message);
      if (currentUserId) {
        await incrementQueryCount(currentUserId); // Increment query count after sending a message
      } else {
        console.error("currentUserId is not set");
      }
    },
    [sendMessage, userProfile, toast, navigate, currentUserId]
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] overflow-hidden">
      <ChatLayout
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      >
        <ChatContent
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onNewChat={startNewChat}
        />
      </ChatLayout>
    </div>
  );
};

export default Chat;