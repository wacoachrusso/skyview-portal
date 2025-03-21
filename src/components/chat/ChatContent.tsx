
import { Message } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatContainer } from "./ChatContainer";
import { OfflineAlert } from "./OfflineAlert";
import { TrialEndedState } from "./TrialEndedState";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string | null;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onNewChat?: () => void;
  isChatDisabled?: boolean;
}

export function ChatContent({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
  onNewChat,
  isChatDisabled = false,
}: ChatContentProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isOffline, offlineError } = useOfflineStatus();
  const { loadError, isTrialEnded } = useFreeTrial(currentUserId, isOffline);
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    subscription_status: string;
    query_count: number;
  } | null>(null);

  // Function to handle copying message content
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  };

  // Fetch user profile from the database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;

      try {
        console.log("[ChatContent] Fetching profile for user:", currentUserId);
        
        // CRITICAL: Check for post-payment condition first
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        
        if (isPostPayment) {
          console.log("[ChatContent] Post-payment state detected");
          
          // Wait briefly to ensure other components have had time to process
          // the post-payment state and update the profile
          console.log("[ChatContent] Waiting briefly before checking profile");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Fetch the profile to verify it's been updated
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("subscription_plan, subscription_status, query_count")
            .eq("id", currentUserId)
            .single();

          if (error) {
            console.error("[ChatContent] Error fetching profile after payment:", error);
            // Don't throw error, proceed with verification
          } else if (profile) {
            console.log("[ChatContent] Profile after payment:", profile);
            setUserProfile(profile);
            
            // Verify subscription was properly updated
            if (profile.subscription_status !== 'active' || 
                profile.subscription_plan === 'free' ||
                profile.subscription_plan === 'trial_ended') {
              
              console.log("[ChatContent] Subscription not properly updated, applying fix");
              
              // Perform an emergency fix - update profile again
              try {
                const planType = localStorage.getItem('selected_plan') || 'monthly';
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    subscription_status: 'active',
                    subscription_plan: planType
                  })
                  .eq("id", currentUserId);
                  
                if (updateError) {
                  console.error("[ChatContent] Error in emergency profile update:", updateError);
                } else {
                  console.log("[ChatContent] Emergency profile update successful");
                  
                  // Update local state to reflect the change
                  setUserProfile({
                    ...profile,
                    subscription_status: 'active',
                    subscription_plan: planType
                  });
                }
              } catch (e) {
                console.error("[ChatContent] Exception in emergency update:", e);
              }
            }
          }
          
          // Clear payment flags after a successful verification
          // But use a delay to ensure all components have processed the state
          const clearFlags = () => {
            console.log("[ChatContent] Clearing post-payment flags");
            localStorage.removeItem('subscription_activated');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
            localStorage.removeItem('login_in_progress');
            localStorage.removeItem('auth_access_token');
            localStorage.removeItem('auth_refresh_token');
            localStorage.removeItem('auth_user_id');
            localStorage.removeItem('auth_user_email');
          };
          
          // Set a longer timeout to clear flags - much longer than in previous versions
          setTimeout(clearFlags, 10000); // 10 seconds
          return;
        }
        
        // For non-payment flow: Standard profile fetch
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_plan, subscription_status, query_count")
          .eq("id", currentUserId)
          .single();

        if (error) {
          console.error("[ChatContent] Error fetching user profile:", error);
          return;
        }

        console.log("[ChatContent] User profile:", profile);
        setUserProfile(profile);
        
        // Skip trial end check during login/payment processes
        const skipCheck = 
          localStorage.getItem('login_in_progress') === 'true' || 
          localStorage.getItem('payment_in_progress') === 'true';
        
        if (!skipCheck && profile.subscription_plan === "free" && profile.query_count >= 2) {
          console.log("[ChatContent] Free trial ended, redirecting to pricing");
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          navigate("/?scrollTo=pricing-section", { replace: true });
        }
      } catch (error) {
        console.error("[ChatContent] Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [currentUserId, navigate, toast]);

  // Determine if the chat should be disabled
  const shouldDisableChat = useMemo(() => {
    // Skip all checks if we're in post-payment state
    if (localStorage.getItem('subscription_activated') === 'true') {
      return false;
    }
    
    return isChatDisabled || 
           isTrialEnded || 
           (userProfile?.subscription_plan === "free" && userProfile?.query_count >= 2) ||
           (userProfile?.subscription_status === 'inactive' && userProfile?.subscription_plan !== 'free');
  }, [isChatDisabled, isTrialEnded, userProfile]);

  // Auto-redirect if trial has ended
  useEffect(() => {
    // Skip redirect if in special states
    if (localStorage.getItem('subscription_activated') === 'true' ||
        localStorage.getItem('login_in_progress') === 'true' ||
        localStorage.getItem('payment_in_progress') === 'true') {
      return;
    }
    
    if (shouldDisableChat && currentUserId) {
      console.log("[ChatContent] Chat is disabled, redirecting to pricing");
      navigate("/?scrollTo=pricing-section", { replace: true });
    }
  }, [shouldDisableChat, navigate, currentUserId]);

  // If the trial has ended or chat is disabled, show the TrialEndedState
  if (shouldDisableChat) {
    return <TrialEndedState />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <ChatHeader onNewChat={onNewChat} />
      
      {isOffline && <OfflineAlert offlineError={offlineError} />}
      
      <ChatContainer 
        messages={messages} 
        isLoading={isLoading} 
        currentUserId={currentUserId || ""}
        onCopyMessage={handleCopyMessage}
      />
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
        disabled={isChatDisabled}
      />
    </div>
  );
}
