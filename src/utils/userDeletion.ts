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
  console.log("Deleting all user data:", userId);
  
  try {
    // Delete conversations and their messages (messages will be cascade deleted)
    const { error: conversationsError } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId);

    if (conversationsError) {
      console.error("Error deleting user conversations:", conversationsError);
      throw conversationsError;
    }

    // Delete notifications
    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error("Error deleting user notifications:", notificationsError);
      throw notificationsError;
    }

    // Delete profile
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

    // Step 1: Delete from auth system first (this is important!)
    await deleteUserFromAuthSystem(user.id);
    console.log("Successfully deleted user from auth system");

    // Step 2: Delete all user data
    await deleteUserData(user.id);
    console.log("Successfully deleted all user data");

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