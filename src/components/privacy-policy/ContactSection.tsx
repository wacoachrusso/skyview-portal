import { HelpCircle } from "lucide-react";

export const ContactSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">Contact Us</h2>
      </div>
      <div className="space-y-4 text-muted-foreground">
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p className="font-medium">
          <a href="mailto:support@skyguide.site" className="text-brand-gold hover:underline">
            support@skyguide.site
          </a>
        </p>
        <p>
          We are committed to addressing any concerns you may have about our data practices and 
          will respond to your inquiry promptly.
        </p>
      </div>
    </section>
  );
};