import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onReadPolicy: () => void;
}

export const CancelSubscriptionDialog = ({
  open,
  onClose,
  onConfirm,
  onReadPolicy,
}: CancelSubscriptionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Before You Cancel</AlertDialogTitle>
          <AlertDialogDescription>
            Please review our refund and cancellation policy before proceeding. This will help you understand the implications of cancelling your subscription.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Keep Subscription
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onReadPolicy}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black"
          >
            Read Refund Policy
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirm Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};