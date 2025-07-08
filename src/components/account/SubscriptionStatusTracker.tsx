import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Subscription } from "@/types/subscription";
import { Profile } from "@/types/profile";

interface SubscriptionStatusTrackerProps {
  profile: Profile;
  subscriptionData: Subscription[];
}

export const SubscriptionStatusTracker = ({
  profile,
  subscriptionData,
}: SubscriptionStatusTrackerProps) => {
  const getSubscriptionInfo = () => {
    // Check if we have subscription data
    if (subscriptionData.length === 0) {
      return {
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        daysLeft: 0,
        hasValidData: false,
      };
    }

    // Get the most recent active subscription
    const activeSubscription = subscriptionData.find(sub => sub.payment_status === 'active') || subscriptionData[0];

    if (!activeSubscription.start_at || !activeSubscription.end_at) {
      return {
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        daysLeft: 0,
        hasValidData: false,
      };
    }

    const startDate = new Date(activeSubscription.start_at);
    const endDate = new Date(activeSubscription.end_at);

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = Date.now() - startDate.getTime();
    const progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
    const daysLeft = Math.max(
      0,
      Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return { 
      startDate, 
      endDate, 
      progress, 
      daysLeft, 
      hasValidData: true,
      subscription: activeSubscription
    };
  };

  const { startDate, endDate, progress, daysLeft, hasValidData, subscription } = getSubscriptionInfo();

  // Don't render if no valid subscription data
  if (!hasValidData || subscriptionData[0].plan === "free") {
    return null;
  }

  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader>
        <CardTitle className="text-brand-navy">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Period</span>
            <span className="text-gray-900 font-medium">
              {format(startDate, "MMM d, yyyy")} -{" "}
              {format(endDate, "MMM d, yyyy")}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {daysLeft} days remaining
            </span>
            <span className="text-sm text-gray-600">
              Auto-renews on {format(endDate, "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Additional subscription details */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plan Type:</span>
              <span className="text-sm text-gray-900 font-medium capitalize">
                {subscriptionData[0]?.plan || "Free"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm text-gray-900 font-medium capitalize">
                {profile?.subscription_status || 'Active'}
              </span>
            </div>
            {subscription?.price && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm text-gray-900 font-medium">
                  ${subscription.price}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};