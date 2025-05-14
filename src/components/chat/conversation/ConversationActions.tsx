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
  onToggleOffline,
}: ConversationActionsProps) {
  const { theme } = useTheme();

  return (
    <div
      className="flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="icon"
        className="h-6 w-6 p-1 touch-manipulation rounded-sm text-destructive bg-transparent hover:text-[#ffffff] hover:bg-red-500 "
        onClick={onDelete}
        onTouchEnd={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        className={`h-6 w-6 p-1 touch-manipulation rounded-sm bg-transparent hover:bg-secondary ${
          isOffline
            ? "text-brand-gold"
            : theme === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-500 hover:text-white"
        }`}
        onClick={onToggleOffline}
        onTouchEnd={onToggleOffline}
        disabled={downloadInProgress}
      >
        <ArrowDown
          className="h-4 w-4"
        />
      </Button>
    </div>
  );
}