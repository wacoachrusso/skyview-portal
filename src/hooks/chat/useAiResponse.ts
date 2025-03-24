
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useErrorState } from "@/hooks/useErrorState";

/**
 * Hook to handle AI responses with optimal performance for near-instant responses
 */
export function useAiResponse() {
  const { toast } = useToast();
  const { handleError } = useErrorState();

  // Get AI response with streaming and improved error handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Extended timeout (30s) to prevent premature timeout errors
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout after 30 seconds")), 30000);
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
          retryCount: 3   // Allow more retries at the function level
        },
      });

      // Use Promise.race for fastest possible resolution
      const result = await Promise.race([
        responsePromise,
        timeoutPromise
      ]) as any;
      
      if (!result.data && result.error) {
        console.error("Error in AI response:", result.error);
        
        // Improved error message for different error types
        const errorMessage = result.error.message || "Unknown error";
        let userMessage = "Failed to get response. Please try again.";
        
        if (errorMessage.includes("timeout")) {
          userMessage = "Request timed out. The service might be busy. Please try again in a moment.";
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          userMessage = "Network error. Please check your connection and try again.";
        } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
          userMessage = "Too many requests. Please wait a moment before trying again.";
        }
        
        toast({
          title: "Error",
          description: userMessage,
          variant: "destructive",
        });
        
        throw new Error(`AI response error: ${errorMessage}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Enhanced error handling with more descriptive messages
      let errorMessage = "Network or server error. Please try again later.";
      
      if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try a shorter question or try again shortly.";
      } else if (error.status === 429 || error.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        errorMessage = "Network connection issue. Please check your internet connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      handleError(new Error("AI response error: " + (error.message || "Unknown error")));
      return { data: null, error: error };
    }
  };

  return { getAiResponse };
}
