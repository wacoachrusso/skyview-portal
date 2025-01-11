import { Button } from "@/components/ui/button";
import { Trash2, ArrowDown } from "lucide-react";

interface ConversationActionsProps {
  isOffline: boolean;
  downloadInProgress: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onToggleOffline: (e: React.MouseEvent) => void;
}

export function ConversationActions({
  isOffline,
  downloadInProgress,
  onDelete,
  onToggleOffline
}: ConversationActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5"
        onClick={onToggleOffline}
        disabled={downloadInProgress}
      >
        <ArrowDown className={`h-4 w-4 ${
          isOffline 
            ? "text-brand-gold" 
            : "text-gray-400 hover:text-white"
        }`} />
      </Button>
    </div>
  );
}