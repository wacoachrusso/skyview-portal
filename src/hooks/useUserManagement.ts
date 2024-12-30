import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { handleUserDeletion } from "@/utils/userDeletion";

export const useUserManagement = () => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfilesRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfilesRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("Fetching users data...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      console.log("Users data fetched:", data);
      return data as ProfilesRow[];
    },
  });

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log("Toggling admin status for user:", userId);
      setUpdatingUser(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
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

      // First verify the profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile) {
        console.error("Profile not found for user:", userId);
        throw new Error("User profile not found");
      }

      // Then update the profile status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating profile status:", updateError);
        throw updateError;
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke(
        "send-account-status-email",
        {
          body: { 
            email, 
            status,
            fullName: profile.full_name || "User"
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

  const handleDeleteUser = async (user: ProfilesRow) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      console.log("Starting user deletion process for:", user);
      await handleUserDeletion(user, async () => {
        await refetch();
      });

      toast({
        title: "Success",
        description: "User account deleted successfully",
      });
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user account",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return {
    users,
    updatingUser,
    selectedUser,
    userToDelete,
    isDeleting,
    setSelectedUser,
    setUserToDelete,
    toggleAdminStatus,
    updateAccountStatus,
    handleDeleteUser,
  };
};