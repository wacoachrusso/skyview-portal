import { Shield } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const AccountSection = () => {
    return (
      <TermsSection icon={<Shield className="h-6 w-6 text-brand-gold" />} title="2. Account Registration and Security">
        <p>
          To access certain features, you must create an account. You agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate, complete, and current information;</li>
          <li>Keep your login credentials confidential;</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
        </ul>
        <p>
          You may not share your account with others. Only one active session per account is permitted.
        </p>
      </TermsSection>
    );
  };