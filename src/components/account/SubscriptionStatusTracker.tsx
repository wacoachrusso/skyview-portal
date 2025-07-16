import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Profile, SubscriptionInfo } from "@/types/profile";
import chalk from "chalk";

/**
 * SubscriptionStatusTracker Component
 * 
 * Purpose: Displays subscription status tracking information for paid users
 * 
 * Features:
 * - Shows current billing period with start/end dates
 * - Displays progress bar indicating time elapsed in current period
 * - Calculates and shows remaining days until renewal
 * - Shows subscription details (plan type, status, amount)
 * - Auto-hides for free plan users
 * 
 * Flow:
 * 1. Validates subscription data availability from profile
 * 2. Extracts subscription info from profile.subscription_id
 * 3. Calculates billing period progress and remaining days
 * 4. Renders progress visualization with key subscription info
 * 5. Returns null for free users or invalid data
 */

interface SubscriptionStatusTrackerProps {
  profile: Profile;
  subscriptionData: SubscriptionInfo | null;
}

export const SubscriptionStatusTracker = ({
  profile,
  subscriptionData,
}: SubscriptionStatusTrackerProps) => {
  console.log(chalk.bgCyan.black.bold(`[SubscriptionStatusTracker] Step 1: Component initialized`));
  console.log(chalk.cyan(`[SubscriptionStatusTracker] Profile:`, profile));
  console.log(chalk.cyan(`[SubscriptionStatusTracker] Subscription data:`, subscriptionData));

  const getSubscriptionInfo = () => {
    console.log(chalk.bgBlue.black.bold(`[SubscriptionStatusTracker] Step 2: Getting subscription info`));

    // Check if we have subscription data
    if (!subscriptionData) {
      console.log(chalk.bgYellow.black.bold(`[SubscriptionStatusTracker] Step 3: No subscription data available`));
      return {
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        daysLeft: 0,
        hasValidData: false,
      };
    }

    console.log(chalk.bgGreen.black.bold(`[SubscriptionStatusTracker] Step 4: Subscription data found`));
    console.log(chalk.green(`[SubscriptionStatusTracker] Subscription:`, subscriptionData));

    if (!subscriptionData.start_at || !subscriptionData.end_at) {
      console.log(chalk.bgRed.white.bold(`[SubscriptionStatusTracker] Step 5: Missing start_at or end_at dates`));
      console.log(chalk.red(`[SubscriptionStatusTracker] start_at: ${subscriptionData.start_at}`));
      console.log(chalk.red(`[SubscriptionStatusTracker] end_at: ${subscriptionData.end_at}`));
      return {
        startDate: new Date(),
        endDate: new Date(),
        progress: 0,
        daysLeft: 0,
        hasValidData: false,
      };
    }

    console.log(chalk.bgGreen.black.bold(`[SubscriptionStatusTracker] Step 6: Calculating subscription progress`));

    const startDate = new Date(subscriptionData.start_at);
    const endDate = new Date(subscriptionData.end_at);

    console.log(chalk.green(`[SubscriptionStatusTracker] Start date: ${startDate.toISOString()}`));
    console.log(chalk.green(`[SubscriptionStatusTracker] End date: ${endDate.toISOString()}`));
    console.log(chalk.green(`[SubscriptionStatusTracker] Current date: ${new Date().toISOString()}`));

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = Date.now() - startDate.getTime();
    const progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
    const daysLeft = Math.max(
      0,
      Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    console.log(chalk.bgBlue.black.bold(`[SubscriptionStatusTracker] Step 7: Progress calculations complete`));
    console.log(chalk.blue(`[SubscriptionStatusTracker] Total duration (ms): ${totalDuration}`));
    console.log(chalk.blue(`[SubscriptionStatusTracker] Elapsed time (ms): ${elapsed}`));
    console.log(chalk.blue(`[SubscriptionStatusTracker] Progress percentage: ${progress}%`));
    console.log(chalk.blue(`[SubscriptionStatusTracker] Days left: ${daysLeft}`));

    return { 
      startDate, 
      endDate, 
      progress, 
      daysLeft, 
      hasValidData: true,
      subscription: subscriptionData
    };
  };

  const { startDate, endDate, progress, daysLeft, hasValidData, subscription } = getSubscriptionInfo();

  // Don't render if no valid subscription data or free plan
  if (!hasValidData || subscriptionData?.plan === "free" || profile?.subscription_plan === "free") {
    console.log(chalk.bgYellow.black.bold(`[SubscriptionStatusTracker] Step 8: Component will not render`));
    console.log(chalk.yellow(`[SubscriptionStatusTracker] hasValidData: ${hasValidData}`));
    console.log(chalk.yellow(`[SubscriptionStatusTracker] Subscription plan: ${subscriptionData?.plan || 'N/A'}`));
    console.log(chalk.yellow(`[SubscriptionStatusTracker] Profile plan: ${profile?.subscription_plan || 'N/A'}`));
    return null;
  }

  console.log(chalk.bgGreen.black.bold(`[SubscriptionStatusTracker] Step 9: Rendering component`));

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
                {subscriptionData?.plan || profile?.subscription_plan || "Free"}
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
            {subscription?.old_plan && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Previous Plan:</span>
                <span className="text-sm text-gray-900 font-medium capitalize">
                  {subscription.old_plan}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};