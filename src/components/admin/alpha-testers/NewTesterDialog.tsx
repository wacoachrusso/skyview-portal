import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TesterFormFields } from "./components/TesterFormFields";
import { generatePassword } from "./utils/passwordUtils";

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
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      isPromoter: false
    }
  });

  const isPromoter = watch('isPromoter');

  const handleGeneratePassword = () => {
    setValue('password', generatePassword());
  };

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

      // Sign out the newly created user immediately to prevent auto-login
      await supabase.auth.signOut();

      // Get the current admin's session again
      const { data: { session: adminSession }, error: adminSessionError } = await supabase.auth.getSession();
      if (adminSessionError) throw adminSessionError;
      if (!adminSession) throw new Error('Admin session lost');

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
          <TesterFormFields
            register={register}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            generatePassword={handleGeneratePassword}
            isPromoter={isPromoter}
          />

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