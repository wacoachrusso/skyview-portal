import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Disclaimer = () => {
  return (
    <Alert className="bg-brand-navy/20 border-brand-gold/20 text-sm">
      <AlertTriangle className="h-4 w-4 text-brand-gold" />
      <AlertDescription className="text-gray-300">
        <p className="mb-2">
          SkyGuide can make mistakes. While we strive for accuracy in interpreting union contracts, you should always verify important information with your union representatives or official union documents. The information provided is for general guidance only.
        </p>
        <p className="mb-2">
          By using SkyGuide, you acknowledge that the app is not a substitute for official union resources or professional advice. Users are responsible for verifying all information before making any decisions based on it.
        </p>
        <p className="font-medium">
          Use of SkyGuide constitutes acceptance of this disclaimer.
        </p>
      </AlertDescription>
    </Alert>
  );
};