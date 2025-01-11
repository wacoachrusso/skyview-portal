import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";

interface DetailItem {
  label: string;
  info: string;
  date: string;
  rating?: number;
  isIncorrect?: boolean;
}

interface DialogContentData {
  title: string;
  data: DetailItem[];
}

interface StatsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: DialogContentData | null;
}

export const StatsDialog = ({ isOpen, onOpenChange, content }: StatsDialogProps) => {
  if (!content) return null;

  const getFeedbackIcon = (rating?: number, isIncorrect?: boolean) => {
    if (isIncorrect) return <Flag className="h-4 w-4 text-red-500" />;
    if (rating === 5) return <ThumbsUp className="h-4 w-4 text-green-500" />;
    if (rating === 1) return <ThumbsDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {content.data?.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border p-4 hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.label}</h3>
                {getFeedbackIcon(item.rating, item.isIncorrect)}
              </div>
              <p className="text-sm text-muted-foreground">{item.info}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                {item.rating && (
                  <Badge variant={item.rating === 5 ? "success" : "destructive"}>
                    Rating: {item.rating}
                  </Badge>
                )}
                {item.isIncorrect && (
                  <Badge variant="destructive">Flagged as Incorrect</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};