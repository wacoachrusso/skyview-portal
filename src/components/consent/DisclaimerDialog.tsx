import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DisclaimerDialogProps {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({
  open,
  onAccept,
  onReject,
}) => {
  const handleAccept = () => {
    onAccept();
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <Dialog open={open} onOpenChange={() => handleReject()}>
      <DialogContent className="sm:max-w-[550px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold mb-2">
            Terms of Service Agreement
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4 text-sm">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-base font-medium mb-2 text-gray-900">Disclaimer Notice</h3>
              <p className="mb-3">
                The information provided by SkyGuide is intended for general
                informational purposes only and is based on the interpretation
                of union contracts. While we strive to ensure accuracy, SkyGuide
                makes no representations or warranties of any kind, express or implied,
                about the completeness, accuracy, reliability, or suitability of the
                information provided.
              </p>
              <p className="mb-3">
                Users are strongly encouraged to consult their union
                representatives or official union documents for definitive
                answers to contractual questions. SkyGuide cannot be held liable
                for any decision made based on the information provided.
              </p>
              <p>
                By clicking "I Accept" below, you acknowledge that you
                understand and agree to these terms of service and limitations.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4 mt-4 pt-2 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleReject}
            className="min-w-[100px]"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black min-w-[100px]"
          >
            I Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};