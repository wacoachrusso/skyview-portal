
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

export interface UserManagementState {
  updatingUser: string | null;
  selectedUser: ProfilesRow | null;
  userToDelete: ProfilesRow | null;
  isDeleting: boolean;
}

export interface UseUserManagementReturn extends UserManagementState {
  users: ProfilesRow[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>;
  setSelectedUser: (user: ProfilesRow | null) => void;
  setUserToDelete: (user: ProfilesRow | null) => void;
  toggleAdminStatus: (userId: string, currentStatus: boolean) => Promise<void>;
  updateAccountStatus: (userId: string, email: string, status: "disabled" | "suspended" | "deleted" | "active") => Promise<void>;
  handleDeleteUser: (user: ProfilesRow) => Promise<void>;
}
