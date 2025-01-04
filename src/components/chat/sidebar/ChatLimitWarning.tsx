import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChatLimitWarningProps {
  conversationCount: number;
}

export function ChatLimitWarning({ conversationCount }: ChatLimitWarningProps) {
  return (
    <Alert className="mx-2 my-2 border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        You have {conversationCount} chats. Consider deleting old ones to keep things organized.
      </AlertDescription>
    </Alert>
  );
}