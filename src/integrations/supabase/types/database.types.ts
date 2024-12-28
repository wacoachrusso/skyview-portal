export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: ConversationsTable;
      messages: MessagesTable;
      notifications: NotificationsTable;
      profiles: ProfilesTable;
      release_note_changes: ReleaseNoteChangesTable;
      release_notes: ReleaseNotesTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      notification_type: "update" | "release" | "system";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}