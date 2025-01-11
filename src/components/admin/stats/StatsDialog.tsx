import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDialogContent } from "./getDialogContent";
import { MetricType } from "./metrics/useMetricsData";
import { useState } from "react";

interface StatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMetric: MetricType | null;
  onRefresh: () => void;
}

export function StatsDialog({ isOpen, onClose, selectedMetric, onRefresh }: StatsDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (feedbackId: string) => {
    try {
      setIsDeleting(true);
      console.log('Deleting feedback:', feedbackId);
      
      const { error } = await supabase
        .from('message_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: "Feedback deleted",
        description: "The feedback has been successfully deleted.",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogContent = getDialogContent(selectedMetric, handleDelete, isDeleting);

  if (!selectedMetric) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
        </DialogHeader>
        {dialogContent.content}
      </DialogContent>
    </Dialog>
  );
}