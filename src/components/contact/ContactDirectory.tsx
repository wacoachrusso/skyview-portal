import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, Users } from "lucide-react";

interface UnionRepresentative {
  id: string;
  full_name: string;
  role: string;
  phone?: string;
  email?: string;
  region?: string;
  committee?: string;
}

export const ContactDirectory = () => {
  const [representatives, setRepresentatives] = useState<UnionRepresentative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        console.log('Fetching union representatives...');
        const { data, error } = await supabase
          .from('union_representatives')
          .select('*')
          .order('full_name');

        if (error) {
          console.error('Error fetching representatives:', error);
          return;
        }

        console.log('Successfully fetched representatives:', data);
        setRepresentatives(data);
      } catch (error) {
        console.error('Error in fetchRepresentatives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center text-foreground/90">Union Representatives</h2>
      {loading ? (
        <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
          <CardContent className="p-6">
            <div className="bg-muted/20 rounded-lg p-4 text-center text-muted-foreground">
              Loading representatives...
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {representatives.map((rep) => (
            <Card 
              key={rep.id} 
              className="bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground/90">{rep.full_name}</h3>
                  <p className="text-muted-foreground font-medium">{rep.role}</p>
                </div>
                
                <div className="space-y-3">
                  {rep.committee && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{rep.committee}</span>
                    </div>
                  )}
                  {rep.region && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{rep.region}</span>
                    </div>
                  )}
                  {rep.phone && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{rep.phone}</span>
                    </div>
                  )}
                  {rep.email && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{rep.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};