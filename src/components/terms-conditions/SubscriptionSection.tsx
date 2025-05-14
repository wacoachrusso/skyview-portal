import { CreditCard } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const SubscriptionSection = () => {
    return (
      <TermsSection icon={<CreditCard className="h-6 w-6 text-brand-gold" />} title="3. Subscription and Payment">
        <p>
          SkyGuide offers free trials and paid subscriptions. By subscribing:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You agree to pay applicable fees based on your selected plan;</li>
          <li>Subscriptions automatically renew unless canceled before the end of the billing cycle;</li>
          <li>Annual plans are non-refundable after the initial trial period unless required by law.</li>
        </ul>
      </TermsSection>
    );
  };