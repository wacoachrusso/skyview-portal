import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const deleteUserFromAuthSystem = async (userId: string) => {
  console.log("Deleting user from auth system:", userId);
  const { error } = await supabase.functions.invoke("delete-user-auth", {
    body: { userId },
  });

  if (error) {
    console.error("Error deleting user from auth system:", error);
    throw error;
  }
};

export const deleteUserData = async (userId: string) => {
  console.log("Starting deletion of all user data for:", userId);
  
  try {
    // Delete all referrals
    console.log("Deleting user referrals...");
    const { error: referralsError } = await supabase
      .from("referrals")
      .delete()
      .eq("referrer_id", userId);

    if (referralsError) {
      console.error("Error deleting user referrals:", referralsError);
      throw referralsError;
    }

    // Delete cookie consents
    console.log("Deleting cookie consents...");
    const { error: cookieConsentsError } = await supabase
      .from("cookie_consents")
      .delete()
      .eq("user_id", userId);

    if (cookieConsentsError) {
      console.error("Error deleting cookie consents:", cookieConsentsError);
      throw cookieConsentsError;
    }

    // Delete disclaimer consents
    console.log("Deleting disclaimer consents...");
    const { error: disclaimerConsentsError } = await supabase
      .from("disclaimer_consents")
      .delete()
      .eq("user_id", userId);

    if (disclaimerConsentsError) {
      console.error("Error deleting disclaimer consents:", disclaimerConsentsError);
      throw disclaimerConsentsError;
    }

    // Delete release note changes
    console.log("Deleting release note changes...");
    const { error: releaseNoteChangesError } = await supabase
      .from("release_note_changes")
      .delete()
      .eq("user_id", userId);

    if (releaseNoteChangesError) {
      console.error("Error deleting release note changes:", releaseNoteChangesError);
      throw releaseNoteChangesError;
    }

    // Delete messages (this will cascade delete conversations)
    console.log("Deleting user messages...");
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("user_id", userId);

    if (messagesError) {
      console.error("Error deleting user messages:", messagesError);
      throw messagesError;
    }

    // Delete conversations
    console.log("Deleting user conversations...");
    const { error: conversationsError } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId);

    if (conversationsError) {
      console.error("Error deleting user conversations:", conversationsError);
      throw conversationsError;
    }

    // Delete notifications
    console.log("Deleting user notifications...");
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error("Error deleting user notifications:", notificationsError);
      throw notificationsError;
    }

    // Delete profile
    console.log("Deleting user profile...");
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      throw profileError;
    }

    console.log("Successfully deleted all user data");
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
};

export const handleUserDeletion = async (
  user: ProfilesRow,
  onSuccess?: () => void
) => {
  try {
    console.log("Starting complete user deletion process for:", user);

    // Step 1: Delete all user data from related tables
    await deleteUserData(user.id);
    console.log("Successfully deleted all user data");

    // Step 2: Delete from auth system
    await deleteUserFromAuthSystem(user.id);
    console.log("Successfully deleted user from auth system");

    // Step 3: Send deletion notification email via Resend
    const { error: emailError } = await supabase.functions.invoke(
      "send-account-status-email",
      {
        body: { 
          email: user.email, 
          status: "deleted",
          fullName: user.full_name || "User"
        },
      }
    );

    if (emailError) {
      console.error("Error sending deletion email:", emailError);
      // Don't throw here, as the main deletion process is complete
      // Just log the error and continue
    } else {
      console.log("Successfully sent deletion notification email");
    }

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error("Error in user deletion process:", error);
    throw error;
  }
};