import { Book } from "lucide-react";
import { TermsSection } from "./TermsSection";

export const ServiceUseSection = () => {
    return (
      <TermsSection icon={<Book className="h-6 w-6 text-brand-gold" />} title="4. Use of the Service">
        <p>
          SkyGuide provides insights based on uploaded or assigned union contracts. You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the Service for any unlawful purpose;</li>
          <li>Reverse engineer, copy, or distribute any part of the Service;</li>
          <li>Misrepresent your identity or role within an airline.</li>
        </ul>
      </TermsSection>
    );
  };