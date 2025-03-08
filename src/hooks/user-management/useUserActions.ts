
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserActions = (refetch: () => void) => {
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log("Toggling admin status for user:", userId, "Current status:", currentStatus);
      setUpdatingUser(userId);

      // Set the new admin status (opposite of current)
      const newAdminStatus = !currentStatus;
      
      // Always use 'monthly' subscription plan for admins
      const subscriptionPlan = newAdminStatus ? "monthly" : "free";
      
      console.log("Setting admin status to:", newAdminStatus, "and subscription plan to:", subscriptionPlan);

      // Update the profile with the new admin status and subscription plan
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_admin: newAdminStatus,
          subscription_plan: subscriptionPlan
        })
        .eq("id", userId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Verify the update was successful by fetching the updated profile
      const { data: updatedProfile, error: verifyError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (verifyError) {
        console.error("Error verifying profile update:", verifyError);
        throw verifyError;
      }
      
      console.log("Updated profile:", updatedProfile);
      
      // Double-check the admin status was correctly updated
      if (updatedProfile.is_admin !== newAdminStatus) {
        console.error("Admin status was not updated correctly!");
        toast({
          variant: "destructive",
          title: "Error updating admin status",
          description: "The update was not applied correctly. Please try again.",
        });
        return;
      }

      toast({
        title: "Admin status updated",
        description: `User is now ${newAdminStatus ? "an admin" : "not an admin"}`,
      });

      // Refresh the user list
      refetch();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({
        variant: "destructive",
        title: "Error updating admin status",
        description: "Please try again later.",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateAccountStatus = async (userId: string, email: string, status: "disabled" | "suspended" | "deleted" | "active") => {
    try {
      console.log(`Updating account status for ${email} to ${status}`);
      setUpdatingUser(userId);

      const { error } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Account status updated",
        description: `User account is now ${status}`,
      });

      // Refresh the user list
      refetch();
    } catch (error) {
      console.error("Error updating account status:", error);
      toast({
        variant: "destructive",
        title: "Error updating account status",
        description: "Please try again later.",
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
