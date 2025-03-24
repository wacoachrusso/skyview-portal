
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to handle AI responses with optimal performance for near-instant responses
 */
export function useAiResponse() {
  const { toast } = useToast();

  // Get AI response with streaming and improved error handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Increased timeout (15s) to prevent premature timeout errors
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 15000);
    });

    try {
      // Call the AI completion function with high priority flag and streaming enabled
      const responsePromise = supabase.functions.invoke("chat-completion", {
        body: {
          content: `${content}`,
          subscriptionPlan: userProfile?.subscription_plan || "free",
          assistantId: userProfile?.assistant_id || "default_assistant_id",
          priority: true, // Ensure high priority processing
          stream: true,   // Enable streaming for faster initial response
        },
      });

      // Use Promise.race for fastest possible resolution
      const result = await Promise.race([
        responsePromise,
        timeoutPromise
      ]) as any;
      
      if (!result.data && result.error) {
        console.error("Error in AI response:", result.error);
        toast({
          title: "Error",
          description: "Failed to get response. Please try again.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Network or server error. Please try again later.",
        variant: "destructive",
      });
      return { data: null, error: new Error("AI response error: " + (error.message || "Unknown error")) };
    }
  };

  return { getAiResponse };
}
