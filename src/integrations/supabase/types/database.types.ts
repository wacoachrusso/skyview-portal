import { NotificationType } from "./base.types";
import {
  ConversationsTable,
  MessagesTable,
  NotificationsTable,
  ProfilesTable,
  ReleaseNoteChangesTable,
  ReleaseNotesTable,
} from "./tables.types";

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
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}