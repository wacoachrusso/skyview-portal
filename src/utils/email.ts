import { supabase } from "@/integrations/supabase/client";

interface EmailData {
  email: string;
  name: string;
}

export const sendWelcomeEmail = async ({ email, name }: EmailData): Promise<{ error?: Error }> => {
  console.log("Sending welcome email to:", email);
  
  try {
    const { error } = await supabase.functions.invoke('send-welcome-email', {
      body: { 
        email,
        name,
        plan: 'free' // You can make this dynamic if needed
      }
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { error: new Error(error.message) };
    }

    console.log("Welcome email sent successfully");
    return {};
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { error: error instanceof Error ? error : new Error('Unknown error sending welcome email') };
  }
};