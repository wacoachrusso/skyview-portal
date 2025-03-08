
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<ProfilesRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ProfilesRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfilesRow | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Refetch users - explicit implementation for TS
  const refetch = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  // Toggle admin status
  const toggleAdminStatus = useCallback(
    async (userId: string, currentStatus: boolean) => {
      try {
        setUpdatingUser(userId);
        const { error } = await supabase
          .from("profiles")
          .update({ is_admin: !currentStatus })
          .eq("id", userId);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Admin status ${
            currentStatus ? "revoked" : "granted"
          } successfully`,
        });

        // Update local state
        setUsers((prevUsers) =>
          prevUsers?.map((user) =>
            user.id === userId
              ? { ...user, is_admin: !currentStatus }
              : user
          ) || null
        );
      } catch (error) {
        console.error("Error toggling admin status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update admin status.",
        });
      } finally {
        setUpdatingUser(null);
      }
    },
    [toast]
  );

  // Update account status
  const updateAccountStatus = useCallback(
    async (
      userId: string,
      email: string,
      status: "disabled" | "suspended" | "deleted" | "active"
    ) => {
      try {
        setUpdatingUser(userId);
        const { error } = await supabase
          .from("profiles")
          .update({ account_status: status })
          .eq("id", userId);

        if (error) throw error;

        const statusVerb =
          status === "active"
            ? "activated"
            : status === "deleted"
            ? "deleted"
            : status === "disabled"
            ? "disabled"
            : "suspended";

        toast({
          title: "Success",
          description: `Account ${statusVerb} successfully`,
        });

        // Update local state
        setUsers((prevUsers) =>
          prevUsers?.map((user) =>
            user.id === userId
              ? { ...user, account_status: status }
              : user
          ) || null
        );

        // If we're deleting the account, remove it from the users list
        if (status === "deleted") {
          setUsers((prevUsers) =>
            prevUsers?.filter((user) => user.id !== userId) || null
          );
        }
      } catch (error) {
        console.error("Error updating account status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update account status.",
        });
      } finally {
        setUpdatingUser(null);
      }
    },
    [toast]
  );

  // Handle user deletion
  const handleDeleteUser = useCallback(
    async (user: ProfilesRow | null) => {
      if (!user) return;

      try {
        setIsDeleting(true);

        // Call Supabase Function to delete user and all associated data
        const { data, error } = await supabase.functions.invoke(
          "delete-user-auth",
          {
            body: { user_email: user.email },
          }
        );

        if (error) throw error;

        toast({
          title: "Success",
          description: "User deleted successfully",
        });

        // Remove from local state
        setUsers((prevUsers) =>
          prevUsers?.filter((u) => u.id !== user.id) || null
        );
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete user.",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [toast]
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
};

// Import React hooks
import { useEffect } from 'react';
