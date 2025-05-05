import { Button } from "@/components/ui/button";
import { Trash2, ArrowDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

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
  const { theme } = useTheme();

  const arrowColor = isOffline
    ? "text-brand-gold"
    : theme === "dark"
      ? "text-gray-400 hover:text-white"
      : "text-gray-500 hover:text-black";

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5 touch-manipulation"
        onClick={onDelete}
        onTouchEnd={onDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0.5 touch-manipulation"
        onClick={onToggleOffline}
        onTouchEnd={onToggleOffline}
        disabled={downloadInProgress}
      >
        <ArrowDown className={`h-4 w-4 ${arrowColor}`} />
      </Button>
    </div>
  );
}
