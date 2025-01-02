import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Refunds = () => {
  const { handleSignOut } = useAuthManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <DashboardHeader userEmail={null} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 bg-card/95 backdrop-blur-sm shadow-xl">
          <h1 className="text-4xl font-bold text-white mb-8 text-left">Refund and Cancellation Policy</h1>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4 text-left">1. Subscription Refunds</h2>
            <p className="text-gray-300 text-left mb-6">
              SkyGuide subscriptions are billed on a recurring basis (monthly or annually, depending on your selected plan). 
              Please review the following refund policies for our services:
            </p>
            
            <div className="space-y-6 pl-4">
              <div>
                <h3 className="text-xl font-medium text-white mb-3 text-left">Monthly Subscriptions:</h3>
                <ul className="list-disc ml-6 text-gray-300 space-y-2 text-left">
                  <li>Refunds are not provided for monthly subscriptions once the billing cycle has started.</li>
                  <li>To avoid being charged for the next month, you must cancel your subscription at least 24 hours before the next billing date.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white mb-3 text-left">Annual Subscriptions:</h3>
                <ul className="list-disc ml-6 text-gray-300 space-y-2 text-left">
                  <li>Annual subscriptions are eligible for a partial refund if canceled within the first 14 days of purchase. A pro-rated amount will be refunded, minus a $15 administrative fee.</li>
                  <li>After 14 days, refunds for annual subscriptions are not available.</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator className="my-8 bg-brand-navy/20" />

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4 text-left">2. Cancellation Process</h2>
            <ul className="list-disc ml-6 text-gray-300 space-y-2 text-left">
              <li>Users can cancel their subscription at any time by logging into their account and navigating to the "Billing" section.</li>
              <li>After cancellation, you will continue to have access to SkyGuide until the end of the current billing period.</li>
              <li>Once the billing period ends, your subscription will not renew, and your access to SkyGuide services will be revoked.</li>
            </ul>
          </section>

          <Separator className="my-8 bg-brand-navy/20" />

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4 text-left">3. Non-Refundable Items</h2>
            <p className="text-gray-300 mb-4 text-left">The following services are non-refundable:</p>
            <ul className="list-disc ml-6 text-gray-300 space-y-2 text-left">
              <li>One-time purchases or add-ons.</li>
              <li>Any promotional or discounted plans.</li>
              <li>Subscriptions purchased through third-party platforms (refunds must be handled directly with the platform).</li>
            </ul>
          </section>

          <Separator className="my-8 bg-brand-navy/20" />

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4 text-left">4. Refund Exceptions</h2>
            <p className="text-gray-300 mb-4 text-left">Refunds may be considered in exceptional circumstances, such as:</p>
            <ul className="list-disc ml-6 text-gray-300 space-y-2 text-left">
              <li>Proven technical issues that prevent you from using SkyGuide services and cannot be resolved by our support team.</li>
              <li>Duplicate charges for the same account.</li>
            </ul>
            <p className="text-gray-300 mt-4 text-left">
              Please email <a href="mailto:refunds@skyguide.site" className="text-brand-gold hover:underline transition-colors">refunds@skyguide.site</a> with 
              documentation supporting your claim. Refund requests will be reviewed on a case-by-case basis and may take up to 10 business 
              days for processing.
            </p>
          </section>

          <Separator className="my-8 bg-brand-navy/20" />

          <section className="mb-4">
            <h2 className="text-2xl font-semibold text-white mb-4 text-left">5. Contact Information</h2>
            <p className="text-gray-300 text-left">
              If you have questions about this policy or need assistance with cancellations or refunds, please contact us at:
              <br />
              <strong className="text-white">Email:</strong>{" "}
              <a href="mailto:refunds@skyguide.site" className="text-brand-gold hover:underline transition-colors">
                refunds@skyguide.site
              </a>
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default Refunds;