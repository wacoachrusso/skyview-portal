
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MessageMetadataProps {
  timestamp: string;
  feedback?: number | null;
  isStreaming?: boolean;
}

// Local date formatting function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // For today's dates, show time only
  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // For past dates, show abbreviated date and time
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
