import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const useUserActions = (refetch: () => Promise<any>) => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!userId) {
      console.error("Invalid user ID provided to toggleAdminStatus");
      return;
    }

    try {
      console.log("Toggling admin status for user:", userId, "Current status:", currentStatus);
      setUpdatingUser(userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user admin status:", error);
        throw error;
      }

      console.log("Admin status update response:", data);

      toast({
        title: "Success",
        description: `User admin status ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });

      // Immediately refetch to update the UI
      await refetch();
    } catch (error) {
      console.error("Error updating user admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user admin status",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateAccountStatus = async (
    userId: string,
    email: string,
    status: "disabled" | "suspended" | "deleted" | "active"
  ) => {
    try {
      console.log(`Updating account status to ${status} for user:`, userId);
      setUpdatingUser(userId);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke(
        "send-account-status-email",
        {
          body: { 
            email, 
            status,
            fullName: email.split("@")[0] // Fallback if full name not available
          },
        }
      );

      if (emailError) {
        console.error("Error sending status update email:", emailError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Account status updated but failed to send notification email",
        });
      } else {
        console.log("Status update email sent successfully");
        toast({
          title: "Success",
          description: `User account ${status} successfully and notification sent`,
        });
      }
      
      await refetch();
    } catch (error) {
      console.error(`Error ${status} user account:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} user account`,
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  return {
    updatingUser,
    toggleAdminStatus,
    updateAccountStatus,
  };
};