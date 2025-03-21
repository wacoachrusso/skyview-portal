
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle AI responses
 */
export function useAiResponse() {
  // Get AI response with timeout handling
  const getAiResponse = async (content: string, userProfile: any) => {
    console.log("Getting AI response for content:", content);
    console.log("User profile for assistant selection:", userProfile?.airline, userProfile?.user_type);
    
    // Set timeout for AI response
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 30000);
    });

    // Extract user info for assistant selection
    const userInfo = {
      airline: userProfile?.airline || "",
      userType: userProfile?.user_type || ""
    };

    // Call the AI completion function
    const responsePromise = supabase.functions.invoke("chat-completion", {
      body: {
        content: `${content}`,
        subscriptionPlan: userProfile?.subscription_plan || "free",
        assistantId: userProfile?.assistant_id || "default_assistant_id",
        userInfo: userInfo
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
