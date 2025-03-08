
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { useToast } from "@/hooks/use-toast";
import { UserManagementState, UseUserManagementReturn } from "./user-management/types";

export function useUserManagement(): UseUserManagementReturn {
  const { toast } = useToast();
  const [users, setUsers] = useState<ProfilesRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfilesRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfilesRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    return fetchUsers();
  }, [fetchUsers]);

  const toggleAdminStatus = useCallback(
    async (userId: string, currentStatus: boolean) => {
      setUpdatingUser(userId);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_admin: !currentStatus })
          .eq("id", userId);

        if (error) throw error;

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, is_admin: !currentStatus }
              : user
          )
        );

        toast({
          title: "Success",
          description: `Admin status ${
            !currentStatus ? "granted" : "revoked"
          }`,
        });
      } catch (error) {
        console.error("Error updating admin status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update admin status",
        });
      } finally {
        setUpdatingUser(null);
      }
    },
    [toast]
  );

  const updateAccountStatus = useCallback(
    async (userId: string, email: string, status: "disabled" | "suspended" | "deleted" | "active") => {
      setUpdatingUser(userId);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ account_status: status })
          .eq("id", userId);

        if (error) throw error;

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, account_status: status } : user
          )
        );

        // If setting to deleted, remove from the list
        if (status === "deleted") {
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        }

        toast({
          title: "Success",
          description: `Account status updated to ${status}`,
        });
      } catch (error) {
        console.error("Error updating account status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update account status",
        });
      } finally {
        setUpdatingUser(null);
      }
    },
    [toast]
  );

  const handleDeleteUser = useCallback(
    async (user: ProfilesRow) => {
      if (!user || !user.id) return;

      setIsDeleting(true);
      try {
        // Update account status to deleted
        await updateAccountStatus(user.id, user.email || "", "deleted");

        // Could also call a Supabase function to delete the auth user if needed
        // await supabase.functions.invoke('delete-user-auth', { body: { userId: user.id } });

        setUserToDelete(null);
        toast({
          title: "Success",
          description: "User marked as deleted",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete user",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [toast, updateAccountStatus]
  );

  return {
    users,
    updatingUser,
    selectedUser,
    userToDelete,
    isDeleting,
    isLoading,
    refetch,
    setSelectedUser,
    setUserToDelete,
    toggleAdminStatus,
    updateAccountStatus,
    handleDeleteUser,
  };
}
