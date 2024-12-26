export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'app_update' | 'negotiation' | 'general';
  is_read: boolean;
  created_at: string;
}