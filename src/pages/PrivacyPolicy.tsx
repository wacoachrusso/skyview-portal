import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PolicyHeader } from "@/components/privacy-policy/PolicyHeader";
import { CommitmentSection } from "@/components/privacy-policy/CommitmentSection";
import { InformationSection } from "@/components/privacy-policy/InformationSection";
import { DataProtectionSection } from "@/components/privacy-policy/DataProtectionSection";
import { DataUsageSection } from "@/components/privacy-policy/DataUsageSection";
import { PrivacyRightsSection } from "@/components/privacy-policy/PrivacyRightsSection";
import { InternationalTransfersSection } from "@/components/privacy-policy/InternationalTransfersSection";
import { ContactSection } from "@/components/privacy-policy/ContactSection";
import PublicLayout from "@/components/layout/PublicLayout";

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
          <PolicyHeader />

          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-8">
              <CommitmentSection />

              <Separator />
              <InformationSection />

              <Separator />
              <DataProtectionSection />

              <Separator />
              <DataUsageSection />

              <Separator />
              <PrivacyRightsSection />

              <Separator />
              <InternationalTransfersSection />

              <Separator />
              <ContactSection />
            </div>
          </ScrollArea>
        </div>
      </main>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
