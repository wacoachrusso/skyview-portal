import { Shield } from "lucide-react";

export const CommitmentSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">Our Commitment to Privacy</h2>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        At SkyGuide, we are deeply committed to protecting your privacy and ensuring the security of your personal information. 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our aviation 
        intelligence platform and related services.
      </p>
    </section>
  );
};