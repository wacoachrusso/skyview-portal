import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OfflineAlertProps {
  offlineError?: string | null;
}

export function OfflineAlert({ offlineError }: OfflineAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4 mx-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        You are currently offline. You can view your previous conversations, but new messages cannot be sent.
        {offlineError && <div className="mt-2 text-sm">{offlineError}</div>}
      </AlertDescription>
    </Alert>
  );
}