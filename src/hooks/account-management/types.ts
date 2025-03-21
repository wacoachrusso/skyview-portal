
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  subscription_plan: string;
  query_count: number;
  last_query_timestamp: string;
  account_status?: string;
  [key: string]: any; // For any other fields
}

export interface UseProfileLoaderReturn {
  isLoading: boolean;
  userEmail: string | null;
  profile: Profile | null;
  authUser: User | null;
}

export interface UseAccountActionsReturn {
  handleCancelSubscription: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
}
