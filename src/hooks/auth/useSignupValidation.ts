import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const useSignupValidation = () => {
  const { toast } = useToast();

  const validateAssistantConfig = async (formData: SignupData) => {
    console.log('Checking assistant configuration for:', {
      airline: formData.airline,
      jobTitle: formData.jobTitle
    });

    const { data: assistant, error: assistantError } = await supabase
      .from('openai_assistants')
      .select('assistant_id')
      .eq('airline', formData.airline.toLowerCase())
      .eq('work_group', formData.jobTitle.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (assistantError) {
      console.error('Assistant lookup error:', assistantError);
      throw new Error('Error looking up assistant configuration. Please try again.');
    }

    if (!assistant) {
      console.log('No matching assistant found');
      throw new Error('We currently do not support your airline and role combination. Please contact support for assistance.');
    }

    return assistant.assistant_id;
  };

  const createUserAccount = async (formData: SignupData, assistantId: string, plan: string = 'free') => {
    console.log('Creating user account:', { email: formData.email, plan });

    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          user_type: formData.jobTitle.toLowerCase(),
          airline: formData.airline.toLowerCase(),
          subscription_plan: plan,
          assistant_id: assistantId
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    if (!data.user) {
      console.error("No user data returned from signup");
      throw new Error('Failed to create account');
    }

    return data;
  };

  return {
    validateAssistantConfig,
    createUserAccount
  };
};