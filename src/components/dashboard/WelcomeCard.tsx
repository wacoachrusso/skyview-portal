import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function WelcomeCard() {
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("");
  const [queriesRemaining, setQueriesRemaining] = useState(0);

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
          // Assuming free trial has 2 queries
          setQueriesRemaining(2 - (profile.query_count || 0));
        }
      }
    };

    loadUserInfo();
  }, []);

  const getUpgradeMessage = () => {
    if (plan === "free") {
      return {
        title: "Upgrade to Premium",
        message: `You have ${queriesRemaining} queries remaining in your free trial. Upgrade now to unlock unlimited queries!`,
        buttonText: "Upgrade Now",
        showCrown: true
      };
    } else if (plan === "monthly") {
      return {
        title: "Save with Annual Plan",
        message: "Switch to our annual plan and save $10! Get all premium features at a discounted rate.",
        buttonText: "Switch to Annual",
        showCrown: true
      };
    }
    return null;
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 bg-gradient-to-br from-brand-navy to-brand-slate">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back, {userEmail}!
        </h2>
        <p className="text-gray-200">
          Current Plan: <span className="font-semibold">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
        </p>
      </Card>

      {upgradeInfo && (
        <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-white mb-2">
              {upgradeInfo.title}
            </h2>
            {upgradeInfo.showCrown && (
              <Crown className="h-6 w-6 text-yellow-400" />
            )}
          </div>
          <p className="text-gray-200 mb-4">
            {upgradeInfo.message}
          </p>
          <Button
            onClick={() => {
              const pricingSection = document.getElementById('pricing-section');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-white hover:bg-white/90 text-purple-600"
          >
            {upgradeInfo.buttonText} <Crown className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}