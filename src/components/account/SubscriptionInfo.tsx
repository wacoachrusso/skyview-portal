
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatusTracker } from "./SubscriptionStatusTracker";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlanUpgradeDialog } from "./PlanUpgradeDialog";
import { plans } from "@/components/landing/pricing/pricingPlans";

interface SubscriptionInfoProps {
  profile: any;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
}

export const SubscriptionInfo = ({ profile, onPlanChange, onCancelSubscription }: SubscriptionInfoProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPlanUpgradeDialog, setShowPlanUpgradeDialog] = useState(false);
  const [targetPlan, setTargetPlan] = useState("");
  
  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getPriceInfo = () => {
    const currentPlanObj = plans.find(p => p.name.toLowerCase() === profile.subscription_plan);
    const targetPlanObj = plans.find(p => p.name.toLowerCase() === targetPlan);
    
    return {
      currentPrice: currentPlanObj?.price || "$4.99/month",
      newPrice: targetPlanObj?.price || "$49.88/year",
    };
  };

  const handleChangePlan = async (newPlan: string) => {
    if (newPlan === profile.subscription_plan) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${formatPlanName(profile.subscription_plan)} plan.`,
      });
      return;
    }
    
    // For free users upgrading to paid plan
    if (profile.subscription_plan === 'free' || profile.subscription_plan === 'trial_ended') {
      onPlanChange(newPlan);
      return;
    }
    
    // For paid users changing between plans, show dialog first
    setTargetPlan(newPlan);
    setShowPlanUpgradeDialog(true);
  };
  
  const handleConfirmPlanChange = async () => {
    if (!targetPlan) return;
    
    setIsUpdating(true);
    
    try {
      // Send plan change request to server
      const { data, error } = await supabase.functions.invoke('send-plan-change-email', {
        body: {
          email: profile.email,
          oldPlan: profile.subscription_plan,
          newPlan: targetPlan,
          fullName: profile.full_name || 'User'
        }
      });
      
      if (error) throw error;
      
      // Update local profile data
      await supabase
        .from('profiles')
        .update({
          subscription_plan: targetPlan
        })
        .eq('id', profile.id);
      
      toast({
        title: "Plan Updated",
        description: `Your subscription has been changed to the ${formatPlanName(targetPlan)} plan.`,
      });
      
      // Redirect to pricing to complete payment if upgrading from monthly to annual
      if (profile.subscription_plan === 'monthly' && targetPlan === 'annual') {
        onPlanChange(targetPlan);
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your subscription. Please try again or contact support.",
      });
    } finally {
      setIsUpdating(false);
      setShowPlanUpgradeDialog(false);
    }
  };

  const getButtonLabel = () => {
    if (profile.subscription_plan === 'monthly') {
      return "Upgrade to Annual";
    } else if (profile.subscription_plan === 'annual') {
      return "Switch to Monthly";
    } else {
      return "Upgrade Plan";
    }
  };

  const getTargetPlan = () => {
    if (profile.subscription_plan === 'monthly') {
      return "annual";
    } else if (profile.subscription_plan === 'annual') {
      return "monthly";
    } else {
      return "monthly"; // Default for free users
    }
  };

  const closePlanUpgradeDialog = () => {
    if (!isUpdating) {
      setShowPlanUpgradeDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-brand-navy">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Current Plan:</span>
              <span className="col-span-2 text-gray-700 capitalize">{profile?.subscription_plan || 'Free'}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Status:</span>
              <span className="col-span-2 text-gray-700 capitalize">{profile?.subscription_status || 'Inactive'}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Queries Used:</span>
              <span className="col-span-2 text-gray-700">{profile?.query_count || 0}</span>
            </div>
            {profile?.last_query_timestamp && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-medium text-brand-navy">Last Query:</span>
                <span className="col-span-2 text-gray-700">
                  {format(new Date(profile.last_query_timestamp), 'PPpp')}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-navy">Plan Management</h3>
            {profile?.subscription_plan === 'free' || profile?.subscription_plan === 'trial_ended' ? (
              <Button
                onClick={() => onPlanChange('paid')}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                disabled={isUpdating}
              >
                Upgrade Plan
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => handleChangePlan(getTargetPlan())}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : getButtonLabel()}
                </Button>
                <Button
                  onClick={onCancelSubscription}
                  variant="destructive"
                  className="w-full transition-colors"
                  disabled={isUpdating}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {profile?.subscription_plan !== 'free' && profile?.subscription_plan !== 'trial_ended' && (
        <SubscriptionStatusTracker profile={profile} />
      )}
      
      {/* Plan Upgrade Dialog */}
      <PlanUpgradeDialog
        open={showPlanUpgradeDialog}
        onClose={closePlanUpgradeDialog}
        onConfirm={handleConfirmPlanChange}
        currentPlan={profile?.subscription_plan || 'free'}
        targetPlan={targetPlan}
        priceInfo={getPriceInfo()}
      />
    </div>
  );
};
