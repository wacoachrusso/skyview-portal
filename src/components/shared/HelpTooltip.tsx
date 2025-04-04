
import { ReactNode } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface HelpTooltipProps {
  text: string;
  children?: ReactNode;
  videoUrl?: string;
  expanded?: boolean;
  className?: string;
}

export const HelpTooltip = ({ 
  text, 
  children, 
  videoUrl, 
  expanded = false,
  className = ""
}: HelpTooltipProps) => {
  // Use HoverCard for expanded tooltips with videos
  if (expanded) {
    return (
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-5 w-5 rounded-full p-0 hover:bg-background/80 ${className}`}
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="sr-only">Help</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <div className="space-y-2">
            <p className="text-sm">{text}</p>
            {videoUrl && (
              <div className="aspect-video mt-2 overflow-hidden rounded-md border">
                <iframe 
                  src={videoUrl} 
                  className="h-full w-full" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  // Use Tooltip for simple text tooltips - adding explicit delays to ensure it shows
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-5 w-5 rounded-full p-0 hover:bg-background/80 ${className}`}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              <span className="sr-only">Help</span>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
