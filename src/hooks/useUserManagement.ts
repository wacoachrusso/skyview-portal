import { useState } from "react";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { useUserData } from "./user-management/useUserData";
import { useUserActions } from "./user-management/useUserActions";
import { useUserDeletion } from "./user-management/useUserDeletion";
import { UseUserManagementReturn } from "./user-management/types";

export const useUserManagement = (): UseUserManagementReturn => {
  const [selectedUser, setSelectedUser] = useState<ProfilesRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfilesRow | null>(null);

  const { data: users, refetch, isLoading } = useUserData();
  const { updatingUser, toggleAdminStatus, updateAccountStatus } = useUserActions(refetch);
  const { isDeleting, handleDeleteUser } = useUserDeletion(refetch);

  // Log current users and their admin status
  console.log('Current users with admin status:', users?.map(u => ({
    email: u.email,
    isAdmin: u.is_admin
  })));

  return {
    users,
    updatingUser,
    selectedUser,
    userToDelete,
    isDeleting,
    isLoading,
    setSelectedUser,
    setUserToDelete,
    toggleAdminStatus,
    updateAccountStatus,
    handleDeleteUser,
  };
};