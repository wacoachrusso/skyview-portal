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

  const verifyAdminStatus = async () => {
    console.log("Verifying admin status...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      throw new Error("No active session found");
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error("Error checking admin status:", profileError);
      throw new Error("Failed to verify admin privileges");
    }

    if (!profile?.is_admin) {
      throw new Error("Only administrators can add testers");
    }

    return session.user.id;
  };

  const checkExistingProfile = async (email: string) => {
    console.log("Checking for existing profile with email:", email);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing profile:", error);
      throw new Error("Failed to verify user status");
    }

    return profile;
  };

  const checkExistingTester = async (email: string) => {
    console.log("Checking for existing tester with email:", email);
    const { data: tester, error } = await supabase
      .from('alpha_testers')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing tester:", error);
      throw error;
    }

    if (tester) {
      throw new Error("This user is already registered as an alpha tester");
    }
  };

  const createAuthUser = async (data: AddTesterFormData) => {
    console.log("Creating new auth user...");
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

  const createAlphaTester = async (data: AddTesterFormData, userId: string) => {
    console.log("Creating alpha tester record...");
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
      console.log("Starting add tester process...");

      // First verify admin status
      await verifyAdminStatus();

      // Check if user already exists as tester
      await checkExistingTester(data.email);

      // Check if profile exists
      const existingProfile = await checkExistingProfile(data.email);
      
      // Create or get user ID
      const userId = existingProfile ? existingProfile.id : (await createAuthUser(data)).id;
      
      // Create alpha tester record
      await createAlphaTester(data, userId);
      
      // Send welcome email
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