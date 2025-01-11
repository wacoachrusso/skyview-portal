import { Globe } from "lucide-react";

export const InternationalTransfersSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">International Data Transfers</h2>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        Your information may be transferred to and processed in countries other than your own. 
        We ensure appropriate safeguards are in place to protect your data in accordance with 
        this Privacy Policy and applicable data protection laws.
      </p>
    </section>
  );
};