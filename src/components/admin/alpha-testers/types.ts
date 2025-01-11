export interface AlphaTester {
  id: string;
  email: string;
  full_name: string | null;
  status: "active" | "inactive" | "removed";
  last_feedback_at: string | null;
  feedback_count: number;
  created_at: string;
  is_promoter: boolean;
  profile_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    user_type: string | null;
    airline: string | null;
  };
}