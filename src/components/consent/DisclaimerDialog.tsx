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
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

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
             <DialogContent className="max-w-2xl bg-luxury-dark border-white/10">
          <DialogHeader>
            <div className="flex items-center space-x-4 mb-4">
              <AlertTriangle className="w-12 h-12 text-yellow-500" strokeWidth={1.5} />
              <DialogTitle className="text-2xl font-bold text-white">
                Important Disclaimer
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-300 space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4 text-base">
                  <p className="font-semibold">
                    Please read carefully before proceeding
                  </p>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                      Legal Notice
                    </h3>
                    <p className="text-gray-300 text-sm">
                      SkyGuide is a digital tool designed to help users interpret the language in their union contracts. It is not an official union resource, legal advisor, or substitute for professional guidance.
                    </p>
                  </div>

                  <h4 className="text-lg font-semibold text-white">Key Points:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li>
                      <strong>Informational Purpose Only:</strong> The app provides interpretive assistance and is not a definitive legal resource.
                    </li>
                    <li>
                      <strong>No Guarantee of Accuracy:</strong> While we strive for precision, SkyGuide does not guarantee the completeness or current status of contract information.
                    </li>
                    <li>
                      <strong>Professional Consultation:</strong> Always consult your union representatives, official contract documents, or legal professionals before taking action.
                    </li>
                    <li>
                      <strong>User Responsibility:</strong> You are solely responsible for verifying any interpretations or decisions made using this tool.
                    </li>
                  </ul>

                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mt-4 ">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Limitation of Liability
                    </h3>
                    <p className="text-gray-300  text-sm">
                      SkyGuide and its creators are not liable for any errors, omissions, or outcomes resulting from the use of this platform. By using this app, you acknowledge and agree to use it at your own risk.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </DialogDescription>
          </DialogHeader>
        <DialogFooter className="flex justify-center gap-4 mt-4  border-gray-200">
          <Button 
            onClick={handleReject}
            className="min-w-[100px] bg-transparent text-brand-gold  hover:bg-brand-gold/10"
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