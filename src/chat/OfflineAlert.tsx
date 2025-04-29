import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OfflineAlertProps {
  offlineError?: string | null;
}

export function OfflineAlert({ offlineError }: OfflineAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4 mx-4 border-red-500/50">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-red-50">You are currently offline</AlertTitle>
      <AlertDescription className="mt-2 text-red-100/90">
        You can view your previous conversations, but new messages cannot be sent.
        {offlineError && <div className="mt-2 font-medium">{offlineError}</div>}
      </AlertDescription>
    </Alert>
  );
}