import { useUserManagement } from "@/hooks/useUserManagement";
import { UsersTable } from "./user-management/UsersTable";
import { UserDetailsDialog } from "./user-management/UserDetailsDialog";
import { DeleteUserDialog } from "./user-management/DeleteUserDialog";

export const UserManagement = () => {
  const {
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
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <UsersTable
        users={users}
        updatingUser={updatingUser}
        toggleAdminStatus={toggleAdminStatus}
        updateAccountStatus={updateAccountStatus}
        setSelectedUser={setSelectedUser}
        setUserToDelete={setUserToDelete}
      />

      <UserDetailsDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <DeleteUserDialog
        user={userToDelete}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};