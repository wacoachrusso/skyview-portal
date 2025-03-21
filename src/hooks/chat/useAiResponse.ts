
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle AI responses
 */
export function useAiResponse() {
  // Get AI response with timeout handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    
    // Set timeout for AI response
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 30000);
    });

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
      timeoutPromise.then(() => ({ data: null, error: new Error("AI response timeout") }))
    ]) as any;

    return result;
  };

  return { getAiResponse };
}
