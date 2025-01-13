import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePassword } from "../utils/passwordUtils";

interface AddTesterFormData {
  email: string;
  fullName: string;
  password: string;
  isPromoter: boolean;
}

export const useAddTester = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const verifyAdminStatus = async (userId: string) => {
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (adminError) {
      console.error("Error checking admin status:", adminError);
      throw new Error("Failed to verify admin privileges");
    }

    if (!adminProfile?.is_admin) {
      console.error("User is not an admin");
      throw new Error("Only administrators can add testers");
    }
  };

  const checkExistingUser = async (email: string) => {
    console.log("Checking for existing profile with email:", email);
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error("Error checking existing profile:", profileError);
      throw new Error("Failed to verify user status");
    }

    console.log("Existing profile check result:", existingProfile);
    return existingProfile;
  };

  const createAuthUser = async (data: AddTesterFormData) => {
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

    return authData.user;
  };

  const checkExistingTester = async (email: string) => {
    const { data: existingTester, error } = await supabase
      .from('alpha_testers')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing tester:", error);
      throw error;
    }

    if (existingTester) {
      throw new Error("This user is already registered as an alpha tester");
    }
  };

  const createAlphaTester = async (data: AddTesterFormData, userId: string) => {
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
  };

  const sendWelcomeEmail = async (data: AddTesterFormData) => {
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
      return false;
    }
    return true;
  };

  const addTester = async (data: AddTesterFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Adding new tester:", data);

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("No active session found");
        throw new Error("Please sign in again to add testers");
      }

      await verifyAdminStatus(session.user.id);
      const existingProfile = await checkExistingUser(data.email);
      await checkExistingTester(data.email);

      const userId = existingProfile ? existingProfile.id : (await createAuthUser(data)).id;
      await createAlphaTester(data, userId);
      
      const emailSent = await sendWelcomeEmail(data);
      
      if (emailSent) {
        toast({
          title: "Success",
          description: `${data.isPromoter ? 'Promoter' : 'Alpha tester'} added and welcome email sent with login credentials`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Tester added but failed to send welcome email",
        });
      }

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error adding alpha tester:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add alpha tester",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addTester,
    isSubmitting,
    generatePassword
  };
};