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

  // Filter out deleted users since they're completely removed now
  const activeUsers = users?.filter(user => user.account_status !== 'deleted') || [];

  return (
    <div className="space-y-4">
      <UsersTable
        users={activeUsers}
        updatingUser={updatingUser}
        toggleAdminStatus={toggleAdminStatus}
        updateAccountStatus={updateAccountStatus}
        setSelectedUser={setSelectedUser}
        setUserToDelete={setUserToDelete}
      />

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {userToDelete && (
        <DeleteUserDialog
          user={userToDelete}
          onConfirm={handleDeleteUser}
          onCancel={() => setUserToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};