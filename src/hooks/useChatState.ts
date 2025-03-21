import { useEffect, useMemo, useState } from "react";
import { Message } from "@/types/chat";
import { useMessageStorage } from "@/hooks/useMessageStorage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useChatState(
  messages: Message[],
  isTrialEnded: boolean,
  isOffline: boolean,
  currentUserId: string | null // Add currentUserId to check query count
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storedMessages, setStoredMessages } = useMessageStorage(messages);
  const [isChatDisabled, setIsChatDisabled] = useState(false); // State to disable chat

  // Function to check if the user has reached the query limit
  const checkQueryLimit = async () => {
    if (!currentUserId) return;

    try {
      // Fetch the user's profile to get the subscription plan and query count
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_plan, query_count")
        .eq("id", currentUserId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      // If the user is on a free plan and has reached the query limit
      if (profile?.subscription_plan === "free" && profile?.query_count >= 2) {
        setIsChatDisabled(true); // Disable chat
        toast({
          title: "Free Trial Ended",
          description: "Please upgrade to a subscription plan to continue using SkyGuide.",
          duration: 5000,
        });
        navigate("/?scrollTo=pricing-section");
      }
    } catch (error) {
      console.error("Error in checkQueryLimit:", error);
      throw error;
    }
  };

  // Check query limit on component mount and when messages change
  useEffect(() => {
    if (currentUserId) {
      checkQueryLimit();
    }
  }, [currentUserId, messages]); // Re-check when messages change

  // Store messages in localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Storing new messages:', messages.length);
      setStoredMessages(messages);
    }
  }, [messages, setStoredMessages]);

  // Redirect to pricing if trial has ended
  useEffect(() => {
    if (isTrialEnded) {
      console.log('Trial ended, redirecting to pricing');
      setIsChatDisabled(true); // Disable chat
      navigate('/?scrollTo=pricing-section');
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000
      });
    }
  }, [isTrialEnded, navigate, toast]);

  // Memoize the display messages
  const displayMessages = useMemo(() => 
    isOffline ? storedMessages : messages
  , [isOffline, storedMessages, messages]);

  return {
    displayMessages,
    isChatDisabled, // Return the isChatDisabled state
  };
}