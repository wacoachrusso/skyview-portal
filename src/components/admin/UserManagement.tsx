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

  // Filter out deleted users completely and ensure we're working with the latest data
  const activeUsers = users?.filter(user => user.account_status !== 'deleted') || [];

  console.log('Current users with statuses:', activeUsers.map(u => ({
    email: u.email,
    status: u.account_status
  })));

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

      <DeleteUserDialog
        user={userToDelete}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
        isDeleting={isDeleting}
        isOpen={!!userToDelete}
      />
    </div>
  );
};