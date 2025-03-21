
import { supabase } from "@/integrations/supabase/client";

export const scheduleFeedbackEmail = async (email: string, name: string, subscriptionType: string) => {
  try {
    console.log("Scheduling feedback email for:", email);
    
    // Schedule the feedback email for 7 days from now
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7);
    
    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert({
        email: email,
        name: name,
        subject: "How's Your SkyGuide Experience?",
        message: "We'd love to hear your feedback on SkyGuide!",
        email_type: "feedback",
        scheduled_for: scheduledDate.toISOString(),
        metadata: {
          subscriptionType: subscriptionType
        }
      });

    if (error) {
      console.error("Error scheduling feedback email:", error);
    } else {
      console.log("Feedback email scheduled successfully for:", email);
    }
  } catch (error) {
    console.error("Error scheduling feedback email:", error);
  }
};
