import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Disclaimer = () => {
  return (
    <Alert className="bg-brand-navy/20 border-brand-gold/20 text-sm">
      <AlertTriangle className="h-4 w-4 text-brand-gold" />
      <AlertDescription className="text-gray-300">
        <p className="mb-2">
          The information provided by SkyGuide is intended for general informational purposes only and is based on the interpretation of union contracts. While we strive to ensure accuracy, SkyGuide can sometimes make mistakes. We do not guarantee the completeness, reliability, or timeliness of the information. Users are encouraged to consult their union representatives or official union documents for definitive answers to contractual questions.
        </p>
        <p className="mb-2">
          SkyGuide is not responsible for any actions taken based on the information provided by the app. By using this service, you agree to assume full responsibility for verifying the accuracy of the information and for any decisions made in reliance on it.
        </p>
        <p className="mb-2">
          SkyGuide does not replace professional advice, and no attorney-client relationship is formed by using the app. If you require legal assistance or professional counsel, please contact a qualified professional.
        </p>
        <p className="font-medium">
          Use of SkyGuide constitutes acceptance of this disclaimer.
        </p>
      </AlertDescription>
    </Alert>
  );
};