export type UnionRepresentativeRole = 'local' | 'regional' | 'national' | 'committee';

export interface UnionRepresentativesTable {
  Row: {
    id: string;
    full_name: string;
    role: UnionRepresentativeRole;
    phone: string | null;
    email: string | null;
    region: string | null;
    committee: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    full_name: string;
    role: UnionRepresentativeRole;
    phone?: string | null;
    email?: string | null;
    region?: string | null;
    committee?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    full_name?: string;
    role?: UnionRepresentativeRole;
    phone?: string | null;
    email?: string | null;
    region?: string | null;
    committee?: string | null;
    created_at?: string;
  };
}