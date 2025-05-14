import { User } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const EligibilitySection = () => {
    return (
      <TermsSection icon={<User className="h-6 w-6 text-brand-gold" />} title="1. Eligibility">
        <p>
          SkyGuide is intended for use by airline professionals, including flight attendants and pilots. By using
          our Service, you represent that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are at least 18 years old;</li>
          <li>You are legally able to enter into a binding agreement;</li>
          <li>You are accessing the Service for personal or professional informational purposes only.</li>
        </ul>
      </TermsSection>
    );
  };