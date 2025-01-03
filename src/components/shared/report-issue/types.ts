export interface ReportIssueFormData {
  title: string;
  description: string;
}

export interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}