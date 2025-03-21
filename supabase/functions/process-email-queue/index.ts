
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing email queue");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Create Supabase client using service role key (admin privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get emails that are scheduled to be sent
    const { data: emails, error: selectError } = await supabase
      .from("scheduled_emails")
      .select("*")
      .eq("status", "processing")
      .limit(50);

    if (selectError) {
      throw new Error(`Error fetching emails: ${selectError.message}`);
    }

    console.log(`Found ${emails?.length || 0} emails to process`);
    
    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ message: "No emails to process" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process each email
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          console.log(`Processing email ${email.id} of type ${email.email_type}`);
          
          // Invoke the appropriate email function based on email_type
          const functionName = determineFunctionName(email.email_type);
          
          // Build the request body based on the email type
          const requestBody = buildRequestBody(email);
          
          // Call the appropriate email function
          const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
            functionName,
            {
              body: requestBody,
            }
          );

          if (functionError) {
            throw new Error(`Error sending email: ${functionError.message}`);
          }

          // Update the email record as sent
          const { error: updateError } = await supabase
            .from("scheduled_emails")
            .update({
              status: "sent",
              processed_at: new Date().toISOString(),
            })
            .eq("id", email.id);

          if (updateError) {
            throw new Error(`Error updating email status: ${updateError.message}`);
          }

          return {
            id: email.id,
            status: "sent",
            success: true,
          };
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
          
          // Mark the email as failed
          await supabase
            .from("scheduled_emails")
            .update({
              status: "failed",
              processed_at: new Date().toISOString(),
              metadata: {
                ...email.metadata,
                error: error.message,
                attempts: (email.metadata?.attempts || 0) + 1,
              },
            })
            .eq("id", email.id);

          return {
            id: email.id,
            status: "failed",
            error: error.message,
            success: false,
          };
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in process-email-queue function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

// Helper function to determine which email function to call
function determineFunctionName(emailType: string): string {
  switch (emailType) {
    case "feedback":
      return "send-subscription-feedback";
    case "welcome":
      return "send-welcome-email";
    case "trial-ended":
      return "send-trial-ended-email";
    case "notification":
      return "send-notification";
    default:
      throw new Error(`Unknown email type: ${emailType}`);
  }
}

// Helper function to build the request body based on email type
function buildRequestBody(email: any): Record<string, any> {
  const { email_type, email: recipientEmail, name, subject, message, metadata } = email;
  
  // Common fields for all email types
  const baseBody = {
    email: recipientEmail,
    name: name,
  };
  
  switch (email_type) {
    case "feedback":
      return {
        ...baseBody,
        subscriptionType: metadata?.subscriptionType || "unknown",
      };
    case "welcome":
      return {
        ...baseBody,
        plan: metadata?.plan || "free",
        footer: metadata?.footer || "",
      };
    case "trial-ended":
      return baseBody;
    case "notification":
      return {
        ...baseBody,
        subject,
        message,
      };
    default:
      return {
        ...baseBody,
        ...metadata,
      };
  }
}

serve(handler);
