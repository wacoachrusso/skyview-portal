
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle AI responses with optimal performance for near-instant responses
 */
export function useAiResponse() {
  // Get AI response with streaming and minimal timeout
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Minimal timeout (5s) for faster error reporting if needed
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 5000);
    });

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
    try {
      const result = await Promise.race([
        responsePromise,
        timeoutPromise
      ]) as any;
      
      return result;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return { data: null, error: new Error("AI response timeout") };
    }
  };

  return { getAiResponse };
}
