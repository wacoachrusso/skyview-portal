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

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("No active session found");
        throw new Error("Please sign in again to add testers");
      }

      // Check admin status
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (adminError) {
        console.error("Error checking admin status:", adminError);
        throw new Error("Failed to verify admin privileges");
      }

      if (!adminProfile?.is_admin) {
        console.error("User is not an admin");
        throw new Error("Only administrators can add testers");
      }

      // Check if user exists in auth system
      const { data: userList, error: userCheckError } = await supabase.auth.admin.listUsers();
      
      if (userCheckError) {
        console.error("Error checking existing user:", userCheckError);
        throw new Error("Failed to verify user status");
      }

      const existingUser = userList.users.find(user => user.email === data.email);
      let userId;

      if (existingUser) {
        // User exists, use their ID
        userId = existingUser.id;
        console.log("Using existing user:", userId);
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              subscription_plan: 'alpha'
            },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (authError) {
          console.error("Error creating auth user:", authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        userId = authData.user.id;
      }

      // Check if user is already an alpha tester
      const { data: existingTester } = await supabase
        .from('alpha_testers')
        .select('id, status')
        .eq('email', data.email)
        .maybeSingle();

      if (existingTester) {
        throw new Error("This user is already registered as an alpha tester");
      }

      // Insert alpha tester record
      const { error: testerError } = await supabase
        .from("alpha_testers")
        .insert({
          email: data.email,
          full_name: data.fullName,
          temporary_password: data.password,
          profile_id: userId,
          status: 'active',
          is_promoter: data.isPromoter
        });

      if (testerError) {
        console.error("Error creating alpha tester record:", testerError);
        throw testerError;
      }

      // Send welcome email
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