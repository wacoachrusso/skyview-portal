import { useState } from "react";
import { Search, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface Representative {
  id: string;
  full_name: string;
  role: 'local' | 'regional' | 'national' | 'committee';
  phone: string;
  email: string;
  region?: string;
  committee?: string;
}

export const ContactDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: representatives, isLoading } = useQuery({
    queryKey: ['representatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('union_representatives')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Representative[];
    },
  });

  const filteredReps = representatives?.filter(rep =>
    rep.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rep.region && rep.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rep.committee && rep.committee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const getRoleDisplay = (role: Representative['role']) => {
    switch (role) {
      case 'local':
        return 'Local Representative';
      case 'regional':
        return 'Regional Representative';
      case 'national':
        return 'National Representative';
      case 'committee':
        return 'Committee Member';
      default:
        return role;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search representatives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReps?.map((rep) => (
          <Card key={rep.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{rep.full_name}</h3>
              <p className="text-sm text-muted-foreground">{getRoleDisplay(rep.role)}</p>
              {rep.region && (
                <p className="text-sm text-muted-foreground">Region: {rep.region}</p>
              )}
              {rep.committee && (
                <p className="text-sm text-muted-foreground">Committee: {rep.committee}</p>
              )}
              <div className="flex gap-2 pt-2">
                {rep.phone && (
                  <button
                    onClick={() => handleCall(rep.phone)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-brand-navy text-white rounded-md hover:bg-brand-navy/90 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                )}
                {rep.email && (
                  <button
                    onClick={() => handleEmail(rep.email)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-brand-slate text-white rounded-md hover:bg-brand-slate/90 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReps?.length === 0 && (
        <p className="text-center text-muted-foreground">
          No representatives found matching your search.
        </p>
      )}
    </div>
  );
};