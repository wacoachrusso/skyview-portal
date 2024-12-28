import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface DetailItem {
  label: string;
  info: string;
  date: string;
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
              <h3 className="font-semibold">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.info}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};