
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ThankYouModal({ isOpen, onClose, email }: ThankYouModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-brand-navy to-brand-slate text-white border-brand-gold/30 max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-brand-gold" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Invitation Sent!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-200">
            Your invitation has been sent to <span className="font-semibold">{email}</span>
          </p>
          
          <p className="text-sm text-gray-300">
            We'll notify you when they join and you'll receive your reward after their first paid month.
          </p>
          
          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold w-full"
            >
              Great, Thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
