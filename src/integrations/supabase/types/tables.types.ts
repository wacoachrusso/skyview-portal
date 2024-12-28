export interface ConversationsTable {
  Row: {
    created_at: string;
    id: string;
    last_message_at: string;
    title: string;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    last_message_at?: string;
    title?: string;
    user_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    last_message_at?: string;
    title?: string;
    user_id?: string;
  };
}

export interface MessagesTable {
  Row: {
    content: string;
    conversation_id: string;
    created_at: string;
    id: string;
    role: string;
    user_id: string | null;
  };
  Insert: {
    content: string;
    conversation_id: string;
    created_at?: string;
    id?: string;
    role: string;
    user_id?: string | null;
  };
  Update: {
    content?: string;
    conversation_id?: string;
    created_at?: string;
    id?: string;
    role?: string;
    user_id?: string | null;
  };
}

export interface NotificationsTable {
  Row: {
    created_at: string;
    id: string;
    is_read: boolean | null;
    message: string;
    notification_type: Database["public"]["Enums"]["notification_type"] | null;
    profile_id: string;
    release_note_id: string | null;
    title: string;
    type: string;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    is_read?: boolean | null;
    message: string;
    notification_type?: Database["public"]["Enums"]["notification_type"] | null;
    profile_id: string;
    release_note_id?: string | null;
    title: string;
    type: string;
    user_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    is_read?: boolean | null;
    message?: string;
    notification_type?: Database["public"]["Enums"]["notification_type"] | null;
    profile_id?: string;
    release_note_id?: string | null;
    title?: string;
    type?: string;
    user_id?: string;
  };
}

export interface ProfilesTable {
  Row: {
    airline: string | null;
    created_at: string;
    email: string | null;
    email_notifications: boolean | null;
    full_name: string | null;
    id: string;
    is_admin: boolean | null;
    last_ip_address: string | null;
    last_query_timestamp: string | null;
    push_notifications: boolean | null;
    push_subscription: Json | null;
    query_count: number | null;
    subscription_plan: string | null;
    user_type: string | null;
  };
  Insert: {
    airline?: string | null;
    created_at?: string;
    email?: string | null;
    email_notifications?: boolean | null;
    full_name?: string | null;
    id: string;
    is_admin?: boolean | null;
    last_ip_address?: string | null;
    last_query_timestamp?: string | null;
    push_notifications?: boolean | null;
    push_subscription?: Json | null;
    query_count?: number | null;
    subscription_plan?: string | null;
    user_type?: string | null;
  };
  Update: {
    airline?: string | null;
    created_at?: string;
    email?: string | null;
    email_notifications?: boolean | null;
    full_name?: string | null;
    id?: string;
    is_admin?: boolean | null;
    last_ip_address?: string | null;
    last_query_timestamp?: string | null;
    push_notifications?: boolean | null;
    push_subscription?: Json | null;
    query_count?: number | null;
    subscription_plan?: string | null;
    user_type?: string | null;
  };
}

export interface ReleaseNoteChangesTable {
  Row: {
    change_type: string;
    changes: Json | null;
    created_at: string;
    id: string;
    release_note_id: string;
    user_id: string;
  };
  Insert: {
    change_type: string;
    changes?: Json | null;
    created_at?: string;
    id?: string;
    release_note_id: string;
    user_id: string;
  };
  Update: {
    change_type?: string;
    changes?: Json | null;
    created_at?: string;
    id?: string;
    release_note_id?: string;
    user_id?: string;
  };
}

export interface ReleaseNotesTable {
  Row: {
    created_at: string | null;
    description: string;
    email_template: string | null;
    id: string;
    is_major: boolean | null;
    last_email_sent: string | null;
    release_date: string | null;
    title: string;
    version: string;
  };
  Insert: {
    created_at?: string | null;
    description: string;
    email_template?: string | null;
    id?: string;
    is_major?: boolean | null;
    last_email_sent?: string | null;
    release_date?: string | null;
    title: string;
    version: string;
  };
  Update: {
    created_at?: string | null;
    description?: string;
    email_template?: string | null;
    id?: string;
    is_major?: boolean | null;
    last_email_sent?: string | null;
    release_date?: string | null;
    title?: string;
    version?: string;
  };
}