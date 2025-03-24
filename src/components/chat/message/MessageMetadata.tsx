
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/conversationUtils";
import { Loader2 } from "lucide-react";

interface MessageMetadataProps {
  timestamp: string;
  feedback?: number | null;
  isStreaming?: boolean;
}

export function MessageMetadata({ timestamp, feedback, isStreaming = false }: MessageMetadataProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-300/70">
      {isStreaming ? (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> 
          <span>Streaming response...</span>
        </div>
      ) : (
        <>
          <span className="text-xs">{formatDate(timestamp)}</span>
          {feedback && (
            <span
              className={cn(
                "text-xs",
                feedback > 3 ? "text-emerald-300/70" : "text-red-300/70"
              )}
            >
              {feedback > 3 ? "👍" : "👎"}
            </span>
          )}
        </>
      )}
    </div>
  );
}
