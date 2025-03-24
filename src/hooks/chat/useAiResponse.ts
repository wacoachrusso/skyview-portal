
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle AI responses with optimized performance
 */
export function useAiResponse() {
  // Get AI response with optimized timeout handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Set a more reasonable timeout for AI response
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 15000);
    });

    try {
      // Call the AI completion function
      const responsePromise = supabase.functions.invoke("chat-completion", {
        body: {
          content: `${content}`,
          subscriptionPlan: userProfile?.subscription_plan || "free",
          assistantId: userProfile?.assistant_id || "default_assistant_id",
        },
      });

      // Race between response and timeout
      const result = await Promise.race([
        responsePromise,
        timeoutPromise
      ]) as any;

      return result;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error("Unknown error during AI response") 
      };
    }
  };

  return { getAiResponse };
}
