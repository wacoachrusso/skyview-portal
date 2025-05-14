import { XCircle } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const TerminationSection = () => {
    return (
      <TermsSection icon={<XCircle className="h-6 w-6 text-brand-gold" />} title="6. Termination">
        <p>
          We reserve the right to suspend or terminate your account if:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You violate these Terms;</li>
          <li>We detect unauthorized access or account sharing;</li>
          <li>We discontinue the Service.</li>
        </ul>
      </TermsSection>
    );
  };
  