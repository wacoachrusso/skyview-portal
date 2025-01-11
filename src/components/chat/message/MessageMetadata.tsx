import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MessageMetadataProps {
  timestamp: string;
  feedback: any;
}

export function MessageMetadata({ timestamp, feedback }: MessageMetadataProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] sm:text-xs opacity-50">
        {format(new Date(timestamp), "h:mm a")}
      </span>
      {feedback && (
        <Badge 
          variant={feedback.rating === 5 ? "success" : feedback.is_incorrect ? "destructive" : "secondary"}
          className="text-[10px]"
        >
          {feedback.is_incorrect ? "Flagged" : feedback.rating === 5 ? "Helpful" : "Not Helpful"}
        </Badge>
      )}
    </div>
  );
}