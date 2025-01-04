import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { deleteUserData } from "./user-management/deleteUserData";
import { deleteUserFromAuthSystem } from "./user-management/deleteUserFromAuth";
import { sendDeletionEmail } from "./user-management/sendDeletionEmail";

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

    // Step 3: Send deletion notification email
    const emailSent = await sendDeletionEmail(user);
    if (!emailSent) {
      console.warn("Failed to send deletion email, but user was deleted successfully");
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

// Re-export for backward compatibility
export { deleteUserData, deleteUserFromAuthSystem, sendDeletionEmail };