
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentPlan: string;
  targetPlan: string;
  priceInfo: {
    currentPrice: string;
    newPrice: string;
  };
}

export function PlanUpgradeDialog({
  open,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
  priceInfo,
}: PlanUpgradeDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      toast({
        title: "Plan Change Initiated",
        description: `Your subscription will be updated to the ${targetPlan} plan after processing.`,
      });
      onClose();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your subscription. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isProcessing && !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Upgrade to {formatPlanName(targetPlan)} Plan
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You are about to change your subscription plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/50 p-4 rounded-md text-sm space-y-2">
            <p className="font-medium">Important Information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Your current {formatPlanName(currentPlan)} subscription ({priceInfo.currentPrice}) will be
                replaced by the {formatPlanName(targetPlan)} plan ({priceInfo.newPrice}).
              </li>
              {targetPlan === "annual" && (
                <li className="font-semibold text-brand-gold">
                  You will be charged the full {priceInfo.newPrice} amount today.
                </li>
              )}
              <li>This change will take effect immediately upon confirmation.</li>
              <li>
                By continuing, you agree to the updated billing terms for your
                subscription.
              </li>
              {targetPlan === "annual" && (
                <li>
                  Annual plans offer significant savings compared to monthly billing.
                </li>
              )}
            </ul>
          </div>

          {targetPlan === "annual" && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-300">
                <span className="font-medium">Annual billing:</span> You'll be charged once per year instead of monthly. This saves you money compared to the monthly plan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-brand-gold hover:bg-brand-gold/90 text-black"
          >
            {isProcessing ? "Processing..." : targetPlan === "annual" ? "Confirm & Pay Now" : "Confirm Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
