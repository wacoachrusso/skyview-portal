import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
    <div className="space-y-4">
      <Input
        placeholder={t('searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-background/50 backdrop-blur-sm">
              <th className="p-3 text-left font-medium">{t('name')}</th>
              <th className="p-3 text-left font-medium">{t('role')}</th>
              <th className="p-3 text-left font-medium">{t('phone')}</th>
              <th className="p-3 text-left font-medium">{t('email')}</th>
              <th className="p-3 text-left font-medium">{t('region')}</th>
              <th className="p-3 text-left font-medium">{t('committee')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReps.length > 0 ? (
              filteredReps.map((rep) => (
                <tr key={rep.id} className="border-t border-border/50 hover:bg-background/50">
                  <td className="p-3">{rep.full_name}</td>
                  <td className="p-3">{rep.role}</td>
                  <td className="p-3">{rep.phone || '-'}</td>
                  <td className="p-3">{rep.email || '-'}</td>
                  <td className="p-3">{rep.region || '-'}</td>
                  <td className="p-3">{rep.committee || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-3 text-center text-muted-foreground">
                  {t('noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}