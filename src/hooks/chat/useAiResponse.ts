
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle AI responses with optimized performance
 */
export function useAiResponse() {
  // Get AI response with optimized timeout handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Reduced timeout for faster UX (from 30s to 15s)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 15000);
    });

    // Call the AI completion function with priority flag
    const responsePromise = supabase.functions.invoke("chat-completion", {
      body: {
        content: `${content}`,
        subscriptionPlan: userProfile?.subscription_plan || "free",
        assistantId: userProfile?.assistant_id || "default_assistant_id",
        priority: true, // Add priority flag
      },
    });

    // Race between response and timeout (using Promise.race for faster resolution)
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
