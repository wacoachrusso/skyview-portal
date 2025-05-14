import { Copyright } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const IntellectualPropertySection = () => {
    return (
      <TermsSection icon={<Copyright className="h-6 w-6 text-brand-gold" />} title="7. Intellectual Property">
        <p>
          All content, software, logos, and branding are owned by SkyGuide, LLC. You may not copy, modify,
          or reuse any part without our written permission.
        </p>
      </TermsSection>
    );
  };