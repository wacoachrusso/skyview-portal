import { Button } from "@/components/ui/button";
import { Trash2, ArrowDown } from "lucide-react";

interface ConversationActionsProps {
  isOffline: boolean;
  downloadInProgress: boolean;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void;
  onToggleOffline: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function ConversationActions({
  isOffline,
  downloadInProgress,
  onDelete,
  onToggleOffline
}: ConversationActionsProps) {
  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(e);
  };

  const handleToggleOffline = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleOffline(e);
  };

  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5 touch-manipulation"
        onClick={handleDelete}
        onTouchEnd={handleDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5 touch-manipulation"
        onClick={handleToggleOffline}
        onTouchEnd={handleToggleOffline}
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