import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { toast } from "@/hooks/use-toast";

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

export const deleteUserConversations = async (userId: string) => {
  console.log("Deleting user conversations:", userId);
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting user conversations:", error);
    throw error;
  }
};

export const handleUserDeletion = async (
  user: ProfilesRow,
  updateAccountStatus: (userId: string, email: string, status: "deleted") => Promise<void>,
  onSuccess?: () => void
) => {
  try {
    console.log("Starting complete user deletion process for:", user);

    // Step 1: Delete from auth system
    await deleteUserFromAuthSystem(user.id);
    console.log("Successfully deleted user from auth system");

    // Step 2: Update account status
    await updateAccountStatus(user.id, user.email || "", "deleted");
    console.log("Successfully updated user account status to deleted");

    // Step 3: Delete conversations
    await deleteUserConversations(user.id);
    console.log("Successfully deleted user conversations");

    toast({
      title: "Success",
      description: "User account completely deleted from the system",
    });

    onSuccess?.();
  } catch (error) {
    console.error("Error in user deletion process:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete user account completely",
    });
    throw error;
  }
};