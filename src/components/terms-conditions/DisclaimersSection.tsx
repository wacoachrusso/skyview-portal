import { AlertTriangle } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const DisclaimersSection = () => {
    return (
      <TermsSection icon={<AlertTriangle className="h-6 w-6 text-brand-gold" />} title="5. Disclaimers">
        <p>
          SkyGuide is not a union, legal, or HR authority. While we strive for accuracy, the information
          provided by the assistant is not guaranteed to be complete or legally binding.
          Always consult your union representative or the official contract for final interpretation.
        </p>
      </TermsSection>
    );
  };