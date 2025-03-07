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
  const [isChatDisabled, setIsChatDisabled] = useState(false); // State to disable chat

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
        .select("subscription_plan, query_count")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      // If the profile doesn't exist, throw an error
      if (!profile) {
        throw new Error(`Profile with id ${userId} not found`);
      }

      // Check if user is already at the limit
      if (profile.subscription_plan === "free" && profile.query_count >= 2) {
        setIsChatDisabled(true);
        return profile.query_count; // Return without incrementing
      }

      // Step 2: Calculate the new query count
      const newCount = (profile?.query_count || 0) + 1;
      console.log("New query count:", newCount);

      // Step 3: Update the query count in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ query_count: newCount })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error details:", {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        throw updateError;
      }

      console.log("Query count updated successfully");
      
      // Step 4: Check if we've hit the limit after incrementing
      if (profile.subscription_plan === "free" && newCount >= 2) {
        setIsChatDisabled(true);
      }
      
      return newCount; // Return the updated query count
    } catch (error) {
      console.error("Error in incrementQueryCount:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  // Check user access and subscription plan on component mount and when currentUserId changes
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUserId) return;
      
      console.log("Checking access...");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, redirecting to home...");
        navigate("/"); // Redirect to home if no session
        return;
      }

      // Fetch user profile to check subscription plan and query count
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, query_count")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      console.log("Fetched profile:", profile);

      // Check if user is on free plan and query_count >= 1
      if (profile?.subscription_plan === "free"  && profile?.query_count >= 2) {
        console.log("Free trial ended, disabling chat...");
        setIsChatDisabled(true); // Disable chat
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
      }
    };

    checkAccess();
  }, [navigate, toast, currentUserId]); // Add currentUserId as a dependency

  

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
      if (isChatDisabled) {
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
        //navigate("/?scrollTo=pricing-section"); // Redirect to pricing
        return; // Do nothing if chat is disabled
      }

      // Check if user is on free plan and query_count >= 1
      if (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 2) {
        setIsChatDisabled(true); // Disable chat
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
        //navigate("/?scrollTo=pricing-section"); // Redirect to pricing
        return;
      }

      // Send the message
      await sendMessage(message);

      // Increment query count and check if it reaches the limit
      if (currentUserId) {
        const newQueryCount = await incrementQueryCount(currentUserId);

        // Fetch updated profile to check query_count
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("subscription_plan, query_count")
          .eq("id", currentUserId)
          .single();

        // Check if query_count >= 1 after incrementing
        if (updatedProfile?.subscription_plan === "free" && updatedProfile?.query_count >= 2) {
          setIsChatDisabled(true); // Disable chat
          toast({
            title: "Free Trial Ended",
            description: "Please select a subscription plan to continue using SkyGuide.",
            duration: 5000,
          });
          //navigate("/?scrollTo=pricing-section"); // Redirect to pricing
        }
      } else {
        console.error("currentUserId is not set");
      }
    },
    [sendMessage, userProfile, toast, navigate, currentUserId, isChatDisabled]
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
          isChatDisabled={isChatDisabled} // Pass the disabled state to ChatContent
        />
      </ChatLayout>
    </div>
  );
};

export default Chat;