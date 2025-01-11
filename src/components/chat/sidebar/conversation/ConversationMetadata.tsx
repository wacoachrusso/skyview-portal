import { format } from "date-fns";
import { ConversationActions } from "./ConversationActions";

interface ConversationMetadataProps {
  lastMessageAt: string;
  isOffline: boolean;
  downloadInProgress: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onToggleOffline: (e: React.MouseEvent) => void;
}

export function ConversationMetadata({
  lastMessageAt,
  isOffline,
  downloadInProgress,
  onDelete,
  onToggleOffline
}: ConversationMetadataProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span>{format(new Date(lastMessageAt), "MMM d, h:mm a")}</span>
      <ConversationActions
        isOffline={isOffline}
        downloadInProgress={downloadInProgress}
        onDelete={onDelete}
        onToggleOffline={onToggleOffline}
      />
    </div>
  );
}