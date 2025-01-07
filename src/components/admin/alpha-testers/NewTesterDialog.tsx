import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewTesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  fullName: string;
}

export const NewTesterDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NewTesterDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Adding new tester:", data);

      const { error } = await supabase.from("alpha_testers").insert({
        email: data.email,
        full_name: data.fullName,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alpha tester added successfully",
      });

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding alpha tester:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add alpha tester",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Alpha Tester</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: true })}
              placeholder="Enter tester's email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName", { required: true })}
              placeholder="Enter tester's full name"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Tester"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};