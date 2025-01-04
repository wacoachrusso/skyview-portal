import { supabase } from "@/integrations/supabase/client";

export const deleteUserData = async (userId: string) => {
  console.log("Starting deletion of all user data for:", userId);
  
  try {
    // Delete all referrals first
    console.log("Deleting user referrals...");
    const { error: referralsError } = await supabase
      .from("referrals")
      .delete()
      .eq("referrer_id", userId);

    if (referralsError) throw referralsError;

    // Delete cookie and disclaimer consents
    console.log("Deleting consents...");
    await Promise.all([
      supabase.from("cookie_consents").delete().eq("user_id", userId),
      supabase.from("disclaimer_consents").delete().eq("user_id", userId)
    ]);

    // Delete conversations and messages
    console.log("Deleting conversations and messages...");
    await Promise.all([
      supabase.from("messages").delete().eq("user_id", userId),
      supabase.from("conversations").delete().eq("user_id", userId)
    ]);

    // Delete notifications
    console.log("Deleting notifications...");
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .or(`user_id.eq.${userId},profile_id.eq.${userId}`);

    if (notificationsError) throw notificationsError;

    // Delete sessions
    console.log("Deleting sessions...");
    const { error: sessionsError } = await supabase
      .from("sessions")
      .delete()
      .eq("user_id", userId);

    if (sessionsError) throw sessionsError;

    // Finally, delete profile
    console.log("Deleting user profile...");
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    console.log("Successfully deleted all user data");
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
};