import { supabase } from "@/integrations/supabase/client";

interface EmailData {
  email: string;
  name: string;
}

const generateUnsubscribeLink = async (email: string): Promise<string> => {
  // Generate token (hash of email + secret)
  const encoder = new TextEncoder();
  const data = encoder.encode(email + process.env.RESEND_WEBHOOK_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Use the correct URL format for Supabase Edge Functions
  const supabaseUrl = new URL(supabase.supabaseUrl);
  return `${supabaseUrl.origin}/functions/v1/handle-unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
};

export const getEmailFooter = async (email: string): Promise<string> => {
  const unsubscribeLink = await generateUnsubscribeLink(email);
  
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p>SkyGuide™ - Your Aviation Career Partner</p>
      <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
      <p style="margin-top: 20px;">
        <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </p>
    </div>
  `;
};

export const sendWelcomeEmail = async ({ email, name }: EmailData): Promise<{ error?: Error }> => {
  console.log("Sending welcome email to:", email);
  
  try {
    const emailFooter = await getEmailFooter(email);
    
    const { error } = await supabase.functions.invoke('send-welcome-email', {
      body: { 
        email,
        name,
        plan: 'free', // You can make this dynamic if needed
        footer: emailFooter
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