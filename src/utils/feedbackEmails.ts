import { supabase } from "@/integrations/supabase/client";

export const scheduleFeedbackEmail = async (email: string, name: string, subscriptionType: string) => {
  try {
    console.log("Scheduling feedback email for:", email);
    
    // Send feedback email after 7 days of subscription
    setTimeout(async () => {
      const { error } = await supabase.functions.invoke('send-subscription-feedback', {
        body: { email, name, subscriptionType }
      });

      if (error) {
        console.error("Error sending feedback email:", error);
      } else {
        console.log("Feedback email sent successfully to:", email);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
  } catch (error) {
    console.error("Error scheduling feedback email:", error);
  }
};