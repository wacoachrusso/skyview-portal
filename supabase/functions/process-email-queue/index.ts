
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const now = new Date().toISOString();
    
    // Get all pending emails that are scheduled to be sent now or earlier
    const { data: emails, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50);
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${emails?.length || 0} emails to process`);
    
    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ message: "No emails to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Process each email
    const results = await Promise.all(emails.map(async (email) => {
      try {
        console.log(`Processing email ID ${email.id} for ${email.email}`);
        
        // Update status to processing
        await supabase
          .from('scheduled_emails')
          .update({ status: 'processing', processing_started_at: new Date().toISOString() })
          .eq('id', email.id);
        
        // Call the appropriate function based on email_type
        let functionName = 'send-notification'; // default
        let payload = {};
        
        switch (email.email_type) {
          case 'subscription_feedback':
            functionName = 'send-subscription-feedback';
            payload = { 
              email: email.email, 
              name: email.name, 
              subscriptionType: email.subscription_type 
            };
            break;
          case 'trial_ended':
            functionName = 'send-trial-ended-email';
            payload = { 
              email: email.email, 
              name: email.name 
            };
            break;
          case 'welcome':
            functionName = 'send-welcome-email';
            payload = { 
              email: email.email, 
              name: email.name, 
              plan: email.subscription_type,
              footer: email.footer || ''
            };
            break;
          // Add other email types as needed
        }
        
        // Invoke the appropriate function
        const { error: invokeError } = await supabase.functions.invoke(functionName, {
          body: payload
        });
        
        if (invokeError) {
          throw invokeError;
        }
        
        // Update the email record to sent
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', email.id);
        
        return { id: email.id, success: true };
      } catch (error) {
        console.error(`Error processing email ID ${email.id}:`, error);
        
        // Update the email record with error
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'error', 
            error_message: error.message || 'Unknown error',
            last_error_at: new Date().toISOString(),
            retry_count: (email.retry_count || 0) + 1
          })
          .eq('id', email.id);
        
        return { id: email.id, success: false, error: error.message };
      }
    }));
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    return new Response(
      JSON.stringify({ 
        processed: results.length,
        success: successCount,
        errors: errorCount,
        details: results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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

serve(handler);
