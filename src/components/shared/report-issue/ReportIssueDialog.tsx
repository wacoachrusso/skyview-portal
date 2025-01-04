import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReportIssueForm } from "./ReportIssueForm";
import { useReportIssue } from "./useReportIssue";
import { ReportIssueDialogProps } from "./types";

export function ReportIssueDialog({ open, onOpenChange }: ReportIssueDialogProps) {
  const { isSubmitting, handleSubmit } = useReportIssue(() => {
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Describe the issue you're experiencing. We'll look into it as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <ReportIssueForm
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}