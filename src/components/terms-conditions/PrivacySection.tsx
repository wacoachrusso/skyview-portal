import { Lock } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const PrivacySection = () => {
    return (
      <TermsSection icon={<Lock className="h-6 w-6 text-brand-gold" />} title="8. Privacy">
        <p>
          Your use of the Service is also governed by our <a href="/privacy-policy" className="text-brand-gold hover:underline">Privacy Policy</a>. We value your privacy and are
          committed to protecting your personal information.
        </p>
      </TermsSection>
    );
  };