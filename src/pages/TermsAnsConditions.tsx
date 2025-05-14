import PublicLayout from "@/components/layout/PublicLayout";
import { AccountSection } from "@/components/terms-conditions/AccountSection";
import { ContactSection } from "@/components/terms-conditions/ContactSection";
import { DisclaimersSection } from "@/components/terms-conditions/DisclaimersSection";
import { EligibilitySection } from "@/components/terms-conditions/EligibilitySection";
import { IntellectualPropertySection } from "@/components/terms-conditions/IntellectualPropertySection";
import { ModificationsSection } from "@/components/terms-conditions/ModificationsSection";
import { PrivacySection } from "@/components/terms-conditions/PrivacySection";
import { ServiceUseSection } from "@/components/terms-conditions/ServiceUseSection";
import { SubscriptionSection } from "@/components/terms-conditions/SubscriptionSection";
import { TerminationSection } from "@/components/terms-conditions/TerminationSection";
import TermsHeader from "@/components/terms-conditions/TermsHeader";
import React from "react";

const TermsAndConditions: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-card shadow-md rounded-lg p-6 sm:p-8">
          <TermsHeader />
          
          <div className="prose max-w-none">
            <p className="mb-6 text-muted-foreground">
              Welcome to SkyGuide! These Terms of Service ("Terms") govern your access to and use of the
              SkyGuide platform, including our website, mobile applications, and other related services
              (collectively, the "Service"), operated by SkyGuide, LLC ("SkyGuide," "we," "our," or "us"). By
              accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <div className="flex flex-col gap-8">
            <EligibilitySection />
            <AccountSection />
            <SubscriptionSection />
            <ServiceUseSection />
            <DisclaimersSection />
            <TerminationSection />
            <IntellectualPropertySection />
            <PrivacySection />
            <ModificationsSection />
            <ContactSection />
            </div>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Accept Terms
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TermsAndConditions;