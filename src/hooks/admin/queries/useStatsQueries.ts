import { supabase } from "@/integrations/supabase/client";

export const fetchUserStats = async (thirtyDaysAgo: Date) => {
  console.log("Fetching user stats...");
  return Promise.all([
    // Total users (excluding deleted)
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .neq('account_status', 'deleted'),
    
    // Active users in last 30 days (excluding deleted)
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .gte("last_query_timestamp", thirtyDaysAgo.toISOString())
      .neq('account_status', 'deleted'),
    
    // New users in last 30 days (excluding deleted)
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .gte("created_at", thirtyDaysAgo.toISOString())
      .neq('account_status', 'deleted'),
  ]);
};

export const fetchSubscriptionStats = async () => {
  console.log("Fetching subscription stats...");
  return Promise.all([
    // Monthly subscribers (active only)
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("subscription_plan", "monthly")
      .neq('account_status', 'deleted'),
    
    // Yearly subscribers (active only)
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("subscription_plan", "yearly")
      .neq('account_status', 'deleted'),
  ]);
};

export const fetchSystemStats = async () => {
  console.log("Fetching system stats...");
  return Promise.all([
    // Active notifications
    supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq('is_read', false),
    
    // Release notes
    supabase
      .from("release_notes")
      .select("*", { count: "exact" }),
  ]);
};

export const fetchTesterStats = async () => {
  console.log("Fetching tester stats...");
  return Promise.all([
    // Active alpha testers
    supabase
      .from("alpha_testers")
      .select("*, profiles(full_name, email)", { count: "exact" })
      .eq("status", "active"),
    
    // Active promoters
    supabase
      .from("alpha_testers")
      .select("*, profiles(full_name, email)", { count: "exact" })
      .eq("status", "active")
      .eq("is_promoter", true),
  ]);
};

export const fetchMessageFeedback = async () => {
  console.log("Fetching message feedback...");
  return supabase
    .from('message_feedback')
    .select(`
      *,
      messages (content),
      user:profiles!message_feedback_profile_id_fkey (full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });
};