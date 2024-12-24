export interface Message {
  id: string;
  content: string;
  user_id: string;
  conversation_id: string;
  created_at: string;
  role: string;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  last_message_at: string;
}