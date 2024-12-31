import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DisclaimerDialogProps {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const DisclaimerDialog = ({ open, onAccept, onReject }: DisclaimerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => onReject()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Important Disclaimer</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              The information provided by SkyGuide is intended for general informational purposes only and is based on the interpretation of union contracts. While we strive to ensure accuracy, SkyGuide can sometimes make mistakes.
            </p>
            <p>
              We do not guarantee the completeness, reliability, or timeliness of the information. Users are encouraged to consult their union representatives or official union documents for definitive answers to contractual questions.
            </p>
            <p>
              By clicking "I Accept" below, you acknowledge that you understand and agree to these terms.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onReject}
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black"
          >
            I Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};