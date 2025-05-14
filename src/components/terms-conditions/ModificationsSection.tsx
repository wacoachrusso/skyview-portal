import { RefreshCw } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const ModificationsSection = () => {
    return (
      <TermsSection icon={<RefreshCw className="h-6 w-6 text-brand-gold" />} title="9. Modifications">
        <p>
          We may update these Terms from time to time. Continued use of the Service constitutes acceptance
          of the revised Terms. We'll notify users of significant changes via email or in-app notice.
        </p>
      </TermsSection>
    );
  };