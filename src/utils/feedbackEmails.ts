
import { supabase } from "@/integrations/supabase/client";

export const scheduleFeedbackEmail = async (email: string, name: string, subscriptionType: string) => {
  try {
    console.log("Scheduling feedback email for:", email);
    
    // Instead of using setTimeout, create a record in the database with a scheduled date
    // The email will be sent by a scheduled function or cron job
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7); // 7 days from now
    
    const { error } = await supabase
      .from('scheduled_emails')
      .insert({
        email: email,
        name: name,
        subscription_type: subscriptionType,
        email_type: 'subscription_feedback',
        scheduled_for: scheduledDate.toISOString(),
        status: 'pending'
      });

    if (error) {
      console.error("Error scheduling feedback email:", error);
      return false;
    }
    
    console.log("Feedback email scheduled successfully for:", email, "on", scheduledDate);
    return true;
  } catch (error) {
    console.error("Error scheduling feedback email:", error);
    return false;
  }
};

// Function to immediately send a feedback email (for testing or manual triggers)
export const sendImmediateFeedbackEmail = async (email: string, name: string, subscriptionType: string) => {
  try {
    console.log("Sending immediate feedback email to:", email);
    
    const { error } = await supabase.functions.invoke('send-subscription-feedback', {
      body: { email, name, subscriptionType }
    });

    if (error) {
      console.error("Error sending feedback email:", error);
      return false;
    }
    
    console.log("Feedback email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return false;
  }
};
