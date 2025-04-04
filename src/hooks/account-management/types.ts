
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  user_type?: string;
  airline?: string;
  employee_id?: string;
  assistant_id?: string;
  address?: string;
  phone_number?: string;
  subscription_plan?: string;
  subscription_id?: string;
  subscription_status?: string;
  subscription_created_at?: string;
  account_status?: string;
  query_count?: number;
  is_admin?: boolean;
  [key: string]: any;
}

export interface UseProfileLoaderReturn {
  isLoading: boolean;
  loadError: string | null;
  userEmail: string | null;
  profile: Profile | null;
  authUser: User | null;
  retryLoading: () => void;
}

export interface UseAccountActionsReturn {
  handleCancelSubscription: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
}

export interface UseAccountManagementReturn {
  isLoading: boolean;
  loadError: string | null;
  userEmail: string | null;
  profile: Profile | null;
  handleCancelSubscription: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  retryLoading: () => void;
}
