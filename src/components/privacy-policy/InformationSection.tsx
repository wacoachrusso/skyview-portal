import { Database } from "lucide-react";

export const InformationSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">Information We Collect</h2>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Name and contact information (email address)</li>
          <li>Professional information (airline affiliation, role)</li>
          <li>Account credentials</li>
          <li>Payment information (processed securely by our payment provider)</li>
        </ul>

        <h3 className="text-lg font-medium">Usage Information</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Chat conversations and queries</li>
          <li>Platform usage patterns and preferences</li>
          <li>Device information and IP address</li>
          <li>Performance analytics and error reports</li>
        </ul>
      </div>
    </section>
  );
};