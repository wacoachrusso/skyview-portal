import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionInfoProps {
  profile: any;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
}

export const SubscriptionInfo = ({ profile, onPlanChange, onCancelSubscription }: SubscriptionInfoProps) => {
  const { toast } = useToast();

  const sendPlanChangeEmail = async (oldPlan: string, newPlan: string) => {
    try {
      console.log('Sending plan change email:', { oldPlan, newPlan });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.error('No user email found');
        return;
      }

      const response = await supabase.functions.invoke('send-plan-change-email', {
        body: {
          email: user.email,
          oldPlan,
          newPlan,
          fullName: profile?.full_name
        },
      });

      if (response.error) {
        console.error('Error sending plan change email:', response.error);
        throw new Error(response.error.message);
      }

      console.log('Plan change email sent successfully');
    } catch (error) {
      console.error('Failed to send plan change email:', error);
      toast({
        title: "Notification Error",
        description: "Failed to send plan change notification email.",
        variant: "destructive",
      });
    }
  };

  const handlePlanChange = async (plan: string) => {
    const oldPlan = profile?.subscription_plan || 'free';
    onPlanChange(plan);
    await sendPlanChangeEmail(oldPlan, plan);
  };

  const handleCancelSubscription = async () => {
    const oldPlan = profile?.subscription_plan || 'free';
    onCancelSubscription();
    await sendPlanChangeEmail(oldPlan, 'free');
  };

  return (
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
          {profile?.subscription_plan === 'free' ? (
            <Button
              onClick={() => handlePlanChange('paid')}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
            >
              Upgrade Plan
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => handlePlanChange('change')}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
              >
                Change Plan
              </Button>
              <Button
                onClick={handleCancelSubscription}
                variant="destructive"
                className="w-full transition-colors"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};