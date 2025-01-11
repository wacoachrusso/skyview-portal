import { Lock } from "lucide-react";

export const DataProtectionSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">How We Protect Your Data</h2>
      </div>
      <div className="space-y-4 text-muted-foreground">
        <p>
          We implement industry-standard security measures to protect your personal information, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>End-to-end encryption for sensitive data</li>
          <li>Regular security audits and updates</li>
          <li>Secure data storage and transmission protocols</li>
          <li>Strict access controls and authentication measures</li>
        </ul>
      </div>
    </section>
  );
};