import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatusTracker } from "./SubscriptionStatusTracker";

interface SubscriptionInfoProps {
  profile: any;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
}

export const SubscriptionInfo = ({ profile, onPlanChange, onCancelSubscription }: SubscriptionInfoProps) => {
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
                onClick={() => onPlanChange('paid')}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
              >
                Upgrade Plan
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => onPlanChange('change')}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                >
                  Change Plan
                </Button>
                <Button
                  onClick={onCancelSubscription}
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
      
      {profile?.subscription_plan !== 'free' && (
        <SubscriptionStatusTracker profile={profile} />
      )}
    </div>
  );
};