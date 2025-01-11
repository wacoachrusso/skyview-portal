export interface Conversation {
  id: string;
  title: string;
  last_message_at: string;
  downloaded_at?: string | null;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  conversation_id: string;
  created_at: string;
  user_id: string | null;
}

export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean | null;
  created_at: string;
  last_ip_address: string | null;
  push_notifications: boolean | null;
  email_notifications: boolean | null;
  account_status: string | null;
  airline: string | null;
  assistant_id: string | null;
  query_count: number | null;
  subscription_plan: string | null;
  user_type: string | null;
}
