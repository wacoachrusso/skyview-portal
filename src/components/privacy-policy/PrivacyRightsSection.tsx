import { Eye } from "lucide-react";

export const PrivacyRightsSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">Your Privacy Rights</h2>
      </div>
      <div className="space-y-4 text-muted-foreground">
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your data in a portable format</li>
        </ul>
      </div>
    </section>
  );
};