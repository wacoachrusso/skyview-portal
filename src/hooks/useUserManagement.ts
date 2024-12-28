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

  const { data: users, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("Fetching users data...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("account_status", "deleted")
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
      refetch();
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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: emailError } = await supabase.functions.invoke(
        "send-account-status-email",
        {
          body: { email, status },
        }
      );

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: `User account ${status} successfully`,
      });
      
      await refetch();
    } catch (error) {
      console.error(`Error ${status} user account:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${status} user account`,
      });
    }
  };

  const handleDeleteUser = async (user: ProfilesRow) => {
    try {
      await handleUserDeletion(user, updateAccountStatus, () => {
        setUserToDelete(null);
        refetch();
      });
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
    }
  };

  return {
    users,
    updatingUser,
    selectedUser,
    userToDelete,
    setSelectedUser,
    setUserToDelete,
    toggleAdminStatus,
    updateAccountStatus,
    handleDeleteUser,
  };
};