import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Flag, Copy } from "lucide-react";

interface MessageActionsProps {
  isCurrentUser: boolean;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onFlag: () => void;
  onCopy: () => void;
  isSubmittingFeedback: boolean;
}

export function MessageActions({ 
  isCurrentUser, 
  onThumbsUp, 
  onThumbsDown, 
  onFlag, 
  onCopy,
  isSubmittingFeedback 
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {!isCurrentUser && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
            onClick={onThumbsUp}
            disabled={isSubmittingFeedback}
          >
            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
            onClick={onThumbsDown}
            disabled={isSubmittingFeedback}
          >
            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
            onClick={onFlag}
            disabled={isSubmittingFeedback}
          >
            <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
        onClick={onCopy}
      >
        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}