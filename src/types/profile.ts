export interface SubscriptionInfo {
  plan: string;
  start_at: string;
  end_at: string;
  stripe_subscription_id: string;
  old_plan?: string;
  payment_status?: string;
  price?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  user_type?: string;
  airline?: string;
  subscription_plan?: string;
  created_at?: string;
  query_count?: number;
  last_ip_address?: string | null;
  last_query_timestamp?: string | null;
  is_admin?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  push_subscription?: any; // Define more specifically if structure is known
  account_status?: string;
  two_factor_enabled?: boolean;
  two_factor_backup_codes?: string[] | null;
  login_attempts?: number;
  assistant_id?: string;
  address?: string | null;
  phone_number?: string | null;
  employee_id?: string | null;
  stripe_customer_id?: string;
  subscription_status?: string;
  role_type?: string;
  subscription_id?: SubscriptionInfo | null | { error: true };
  [key: string]: any;
}