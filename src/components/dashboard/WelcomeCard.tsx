import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function WelcomeCard() {
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("");
  const [queriesRemaining, setQueriesRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setPlan(profile.subscription_plan || "free");
          setQueriesRemaining(2 - (profile.query_count || 0));
        }
      }
    };

    loadUserInfo();
  }, []);

  const handleUpgradeClick = () => {
    console.log("Navigating to pricing section");
    navigate('/?scrollTo=pricing');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 backdrop-blur-sm border-0">
        <h2 className="text-2xl font-semibold text-white/90 mb-2">
          Welcome back
        </h2>
        <p className="text-white/70">
          {userEmail}
        </p>
        <p className="text-white/70 mt-2">
          Plan: <span className="font-medium text-white/90">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
        </p>
      </Card>

      {plan === "free" && (
        <Card className="p-6 bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-sm border-0">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-semibold text-white/90 mb-2">
              Upgrade Available
            </h2>
            <Crown className="h-6 w-6 text-yellow-400" />
          </div>
          <p className="text-white/70 mb-4">
            {queriesRemaining} queries remaining in your free trial. Upgrade for unlimited access.
          </p>
          <Button
            onClick={handleUpgradeClick}
            className="bg-white hover:bg-white/90 text-purple-600"
          >
            Upgrade Now
          </Button>
        </Card>
      )}
    </div>
  );
}