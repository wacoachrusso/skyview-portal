export type ConsentStatus = 'accepted' | 'rejected';

export interface DisclaimerConsentsTable {
  Row: {
    id: string;
    user_id: string | null;
    status: ConsentStatus;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id?: string | null;
    status: ConsentStatus;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string | null;
    status?: ConsentStatus;
    created_at?: string;
  };
}