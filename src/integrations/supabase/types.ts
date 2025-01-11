export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alpha_testers: {
        Row: {
          created_at: string
          email: string
          feedback_count: number | null
          feedback_request_count: number | null
          full_name: string | null
          id: string
          is_promoter: boolean | null
          last_feedback_at: string | null
          last_feedback_request_at: string | null
          notes: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["tester_status"] | null
          temporary_password: string | null
        }
        Insert: {
          created_at?: string
          email: string
          feedback_count?: number | null
          feedback_request_count?: number | null
          full_name?: string | null
          id?: string
          is_promoter?: boolean | null
          last_feedback_at?: string | null
          last_feedback_request_at?: string | null
          notes?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["tester_status"] | null
          temporary_password?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          feedback_count?: number | null
          feedback_request_count?: number | null
          full_name?: string | null
          id?: string
          is_promoter?: boolean | null
          last_feedback_at?: string | null
          last_feedback_request_at?: string | null
          notes?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["tester_status"] | null
          temporary_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alpha_testers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_responses: {
        Row: {
          access_count: number
          airline: string | null
          created_at: string
          id: string
          last_accessed_at: string
          query: string
          response: string
          work_group: string | null
        }
        Insert: {
          access_count?: number
          airline?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string
          query: string
          response: string
          work_group?: string | null
        }
        Update: {
          access_count?: number
          airline?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string
          query?: string
          response?: string
          work_group?: string | null
        }
        Relationships: []
      }
      contract_uploads: {
        Row: {
          file_name: string
          file_path: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          downloaded_at: string | null
          id: string
          last_message_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          downloaded_at?: string | null
          id?: string
          last_message_at?: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          downloaded_at?: string | null
          id?: string
          last_message_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          created_at: string
          id: string
          preferences: Database["public"]["Enums"]["cookie_preference"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Database["public"]["Enums"]["cookie_preference"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Database["public"]["Enums"]["cookie_preference"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      disclaimer_consents: {
        Row: {
          created_at: string
          has_seen_chat_disclaimer: boolean | null
          id: string
          status: Database["public"]["Enums"]["consent_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          has_seen_chat_disclaimer?: boolean | null
          id?: string
          status: Database["public"]["Enums"]["consent_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          has_seen_chat_disclaimer?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["consent_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          is_incorrect: boolean | null
          message_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_incorrect?: boolean | null
          message_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_incorrect?: boolean | null
          message_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_feedback_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type:
            | Database["public"]["Enums"]["notification_type"]
            | null
          profile_id: string
          release_note_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          profile_id: string
          release_note_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          profile_id?: string
          release_note_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_release_note_id_fkey"
            columns: ["release_note_id"]
            isOneToOne: false
            referencedRelation: "release_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      openai_assistants: {
        Row: {
          airline: string
          assistant_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          work_group: string
        }
        Insert: {
          airline: string
          assistant_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          work_group: string
        }
        Update: {
          airline?: string
          assistant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          work_group?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          airline: string | null
          assistant_id: string | null
          created_at: string
          email: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          last_ip_address: string | null
          last_query_timestamp: string | null
          login_attempts: number | null
          push_notifications: boolean | null
          push_subscription: Json | null
          query_count: number | null
          subscription_plan: string | null
          two_factor_backup_codes: string[] | null
          two_factor_enabled: boolean | null
          user_type: string | null
        }
        Insert: {
          account_status?: string | null
          airline?: string | null
          assistant_id?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          last_ip_address?: string | null
          last_query_timestamp?: string | null
          login_attempts?: number | null
          push_notifications?: boolean | null
          push_subscription?: Json | null
          query_count?: number | null
          subscription_plan?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          user_type?: string | null
        }
        Update: {
          account_status?: string | null
          airline?: string | null
          assistant_id?: string | null
          created_at?: string
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_ip_address?: string | null
          last_query_timestamp?: string | null
          login_attempts?: number | null
          push_notifications?: boolean | null
          push_subscription?: Json | null
          query_count?: number | null
          subscription_plan?: string | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          user_type?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referee_email: string
          referee_paid_month: boolean | null
          referral_code: string
          referrer_id: string
          reward_claimed: boolean | null
          reward_eligible_date: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_email: string
          referee_paid_month?: boolean | null
          referral_code: string
          referrer_id: string
          reward_claimed?: boolean | null
          reward_eligible_date?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string
          referee_paid_month?: boolean | null
          referral_code?: string
          referrer_id?: string
          reward_claimed?: boolean | null
          reward_eligible_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      release_note_changes: {
        Row: {
          change_type: string
          changes: Json | null
          created_at: string
          id: string
          release_note_id: string
          user_id: string
        }
        Insert: {
          change_type: string
          changes?: Json | null
          created_at?: string
          id?: string
          release_note_id: string
          user_id: string
        }
        Update: {
          change_type?: string
          changes?: Json | null
          created_at?: string
          id?: string
          release_note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_note_changes_release_note_id_fkey"
            columns: ["release_note_id"]
            isOneToOne: false
            referencedRelation: "release_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      release_notes: {
        Row: {
          created_at: string | null
          description: string
          email_template: string | null
          id: string
          is_major: boolean | null
          last_email_sent: string | null
          release_date: string | null
          title: string
          version: string
        }
        Insert: {
          created_at?: string | null
          description: string
          email_template?: string | null
          id?: string
          is_major?: boolean | null
          last_email_sent?: string | null
          release_date?: string | null
          title: string
          version: string
        }
        Update: {
          created_at?: string | null
          description?: string
          email_template?: string | null
          id?: string
          is_major?: boolean | null
          last_email_sent?: string | null
          release_date?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          invalidated_at: string | null
          ip_address: string | null
          last_activity: string | null
          refresh_token: string | null
          refresh_token_expires_at: string | null
          session_token: string
          status: Database["public"]["Enums"]["session_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          invalidated_at?: string | null
          ip_address?: string | null
          last_activity?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          session_token: string
          status?: Database["public"]["Enums"]["session_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          invalidated_at?: string | null
          ip_address?: string | null
          last_activity?: string | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          session_token?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      union_representatives: {
        Row: {
          committee: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          region: string | null
          role: string
        }
        Insert: {
          committee?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          region?: string | null
          role: string
        }
        Update: {
          committee?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          region?: string | null
          role?: string
        }
        Relationships: []
      }
      vapid_keys: {
        Row: {
          created_at: string
          id: string
          private_key: string
          public_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          private_key: string
          public_key: string
        }
        Update: {
          created_at?: string
          id?: string
          private_key?: string
          public_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_cached_responses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_completely: {
        Args: {
          user_email: string
        }
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      invalidate_other_sessions: {
        Args: {
          p_user_id: string
          p_current_session_token: string
        }
        Returns: undefined
      }
      is_email_from_deleted_profile: {
        Args: {
          email: string
        }
        Returns: boolean
      }
      is_session_valid: {
        Args: {
          p_session_token: string
        }
        Returns: boolean
      }
      refresh_session: {
        Args: {
          p_refresh_token: string
        }
        Returns: {
          session_token: string
          expires_at: string
        }[]
      }
      send_weekly_feedback_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_weekly_promoter_feedback: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      consent_status: "accepted" | "rejected"
      cookie_preference:
        | "essential"
        | "analytics"
        | "marketing"
        | "all"
        | "none"
      notification_type: "update" | "release" | "system"
      session_status: "active" | "expired" | "invalidated"
      tester_status: "active" | "inactive" | "removed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
