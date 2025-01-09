import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { addMonths, addYears, format } from "date-fns";

export function WelcomeCard() {
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [plan, setPlan] = useState("");
  const [queriesRemaining, setQueriesRemaining] = useState(0);
  const [subscriptionStart, setSubscriptionStart] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count, last_query_timestamp, full_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setPlan(profile.subscription_plan || "free");
          setQueriesRemaining(1 - (profile.query_count || 0));
          setSubscriptionStart(profile.last_query_timestamp ? new Date(profile.last_query_timestamp) : new Date());
          // Extract first name from full name
          const firstName = profile.full_name?.split(' ')[0] || '';
          setFirstName(firstName);
        }
      }
    };

    loadUserInfo();
  }, []);

  const getSubscriptionExpiry = () => {
    if (!subscriptionStart || plan === "free") return null;
    
    const startDate = new Date(subscriptionStart);
    return plan === "monthly" 
      ? addMonths(startDate, 1)
      : addYears(startDate, 1);
  };

  const handleUpgradeClick = () => {
    console.log("Navigating to pricing section");
    navigate('/?scrollTo=pricing');
  };

  const expiryDate = getSubscriptionExpiry();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 bg-welcome-card border border-brand-purple/10 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-foreground/90 mb-2">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="text-muted-foreground">
          {userEmail}
        </p>
        <p className="text-muted-foreground mt-2">
          Plan: <span className="font-medium text-brand-purple">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
        </p>
        {expiryDate && (
          <p className="text-muted-foreground mt-2">
            Your subscription will auto-renew on <span className="font-medium text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded">{format(expiryDate, 'MMMM d, yyyy')}</span> unless canceled
          </p>
        )}
      </Card>

      {plan === "free" && (
        <Card className="p-6 bg-stats-card border border-brand-orange/10 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-semibold text-foreground/90 mb-2">
              Upgrade Available
            </h2>
            <Crown className="h-6 w-6 text-brand-orange" />
          </div>
          <p className="text-muted-foreground mb-4">
            {queriesRemaining} query remaining in your free trial. Upgrade for unlimited access.
          </p>
          <Button
            onClick={handleUpgradeClick}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            Upgrade Now
          </Button>
        </Card>
      )}
    </div>
  );
}