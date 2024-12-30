import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Users } from "lucide-react";

interface Representative {
  id: string;
  full_name: string;
  role: string;
  phone?: string;
  email?: string;
  region?: string;
  committee?: string;
}

export function ContactDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives'],
    queryFn: async () => {
      console.log('Fetching representatives...');
      const { data, error } = await supabase
        .from('union_representatives')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching representatives:', error);
        throw error;
      }

      console.log('Representatives fetched:', data);
      return data as Representative[];
    },
    retry: 1,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: t('loadError'),
          variant: "destructive",
        });
      }
    }
  });

  const filteredReps = representatives?.filter(rep =>
    rep.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.committee?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Input
        placeholder={t('searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md mx-auto"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReps.length > 0 ? (
          filteredReps.map((rep) => (
            <Card key={rep.id} className="bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">{rep.full_name}</h3>
                <p className="text-sm text-muted-foreground">{rep.role}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {rep.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{rep.phone}</span>
                  </div>
                )}
                {rep.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${rep.email}`} className="hover:underline">
                      {rep.email}
                    </a>
                  </div>
                )}
                {rep.region && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{rep.region}</span>
                  </div>
                )}
                {rep.committee && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{rep.committee}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            {t('noResults')}
          </div>
        )}
      </div>
    </div>
  );
}