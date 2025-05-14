import { Mail } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const ContactSection = () => {
    return (
      <TermsSection icon={<Mail className="h-6 w-6 text-brand-gold" />} title="10. Contact">
        <p className="text-[#ffffff]">
          For questions or concerns, contact us at:
          <br />
          SkyGuide, LLC
          <br />
          Email: <a href="mailto:support@skyguide.site" className="text-brand-gold hover:underline">support@skyguide.site</a>
        </p>
      </TermsSection>
    );
  };