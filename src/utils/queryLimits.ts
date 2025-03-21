import { supabase } from "@/integrations/supabase/client";

export const checkQueryLimit = async (userId: string): Promise<{ canQuery: boolean; message?: string }> => {
  try {
    // Get user's profile and subscription plan
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_plan, query_count, last_ip_address')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // If user is not on free plan, they can always query
    if (profile.subscription_plan !== 'free') {
      return { canQuery: true };
    }

    // Check query count for free users
    if (profile.query_count >= 1) {
      return {
        canQuery: false,
        message: "You've reached your free trial limit. Please upgrade to continue querying."
      };
    }

    // Get user's current IP
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();

    // If IP is different from last query and user has reached limit, prevent query
    if (profile.last_ip_address !== ip && profile.query_count >= 2) {
      return {
        canQuery: false,
        message: "Free trial limit reached. Creating multiple accounts is not allowed."
      };
    }

    // Update IP and increment query count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        query_count: (profile.query_count || 0) + 1,
        last_ip_address: ip,
        last_query_timestamp: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { canQuery: true };
  } catch (error) {
    console.error('Error checking query limit:', error);
    return {
      canQuery: false,
      message: "Error checking query limit. Please try again later."
    };
  }
};