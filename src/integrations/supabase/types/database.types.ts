
import { NotificationType } from "./base.types";
import {
  ConversationsTable,
  MessagesTable,
  NotificationsTable,
  ProfilesTable,
  ReleaseNoteChangesTable,
  ReleaseNotesTable,
  ScheduledEmailsTable,
} from "./tables.types";
import { UnionRepresentativesTable } from "./union-representatives.types";
import { DisclaimerConsentsTable } from "./disclaimer.types";

export interface Database {
  public: {
    Tables: {
      conversations: ConversationsTable;
      messages: MessagesTable;
      notifications: NotificationsTable;
      profiles: ProfilesTable;
      release_note_changes: ReleaseNoteChangesTable;
      release_notes: ReleaseNotesTable;
      union_representatives: UnionRepresentativesTable;
      disclaimer_consents: DisclaimerConsentsTable;
      scheduled_emails: ScheduledEmailsTable;
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
