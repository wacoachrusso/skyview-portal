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
    isLoading,
  } = useUserManagement();

  // Filter out deleted users and null values completely
  const activeUsers = users?.filter(user => 
    user && 
    user.id && 
    user.account_status !== 'deleted'
  ) || [];

  console.log('Current users with statuses:', activeUsers.map(u => ({
    email: u.email,
    status: u.account_status
  })));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

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

      {selectedUser && selectedUser.id && (
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