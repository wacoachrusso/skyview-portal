import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface NewTesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  fullName: string;
  password: string;
  isPromoter: boolean;
}

export const NewTesterDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NewTesterDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      isPromoter: false
    }
  });

  const isPromoter = watch('isPromoter');

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Adding new tester:", data);

      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Not authenticated');

      // First check if current user is admin using their ID
      const { data: adminCheck, error: adminError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (adminError) throw adminError;
      if (!adminCheck?.is_admin) {
        throw new Error('Only administrators can add testers');
      }

      console.log("Creating auth user with provided credentials");

      // Create auth user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            subscription_plan: 'alpha'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Insert alpha tester record
      const { error: testerError } = await supabase
        .from("alpha_testers")
        .insert({
          email: data.email,
          full_name: data.fullName,
          temporary_password: data.password,
          profile_id: authData.user.id,
          status: 'active',
          is_promoter: data.isPromoter
        });

      if (testerError) throw testerError;

      // Send welcome email with credentials
      console.log("Sending welcome email to new tester");
      const { error: emailError } = await supabase.functions.invoke("send-alpha-welcome", {
        body: { 
          email: data.email,
          fullName: data.fullName,
          temporaryPassword: data.password,
          loginUrl: `${window.location.origin}/login`,
          isPromoter: data.isPromoter
        },
      });

      if (emailError) {
        console.error("Error sending welcome email:", emailError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Tester added but failed to send welcome email",
        });
      } else {
        toast({
          title: "Success",
          description: `${data.isPromoter ? 'Promoter' : 'Alpha tester'} added and welcome email sent with login credentials`,
        });
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding alpha tester:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add alpha tester",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {isPromoter ? 'Promoter' : 'Alpha Tester'}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: true })}
              placeholder="Enter password"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPromoter"
              {...register("isPromoter")}
            />
            <Label htmlFor="isPromoter">Add as Promoter</Label>
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
              {isSubmitting ? "Adding..." : `Add ${isPromoter ? 'Promoter' : 'Tester'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};