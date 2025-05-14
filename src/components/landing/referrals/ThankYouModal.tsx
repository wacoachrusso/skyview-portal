import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ThankYouModal({ isOpen, onClose, email }: ThankYouModalProps) {
  const { theme } = useTheme();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${
        theme === "dark" 
          ? "bg-gradient-to-br from-brand-navy to-brand-slate text-white border-brand-gold/30" 
          : "bg-gradient-to-br from-white to-slate-100 text-slate-800 border-brand-gold/20"
      } max-w-md`}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-brand-gold" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Invitation Sent!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className={`${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
            Your invitation has been sent to <span className="font-semibold">{email}</span>
          </p>
          
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
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