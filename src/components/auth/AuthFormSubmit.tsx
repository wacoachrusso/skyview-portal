import { supabase } from "@/integrations/supabase/client";

interface AuthFormSubmitProps {
  e: React.FormEvent;
  formData: {
    email: string;
    password: string;
    fullName: string;
    jobTitle: string;
    airline: string;
  };
  finalSelectedPlan: string;
  setLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
  toast: any;
  setPasswordError: (error: string | null) => void;
}

export const AuthFormSubmit = async ({
  e,
  formData,
  finalSelectedPlan,
  setLoading,
  navigate,
  toast,
  setPasswordError
}: AuthFormSubmitProps) => {
  e.preventDefault();
  
  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!hasMinLength) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (!hasUpperCase) {
      setPasswordError("Password must include at least one uppercase letter");
      return false;
    }
    if (!hasNumber) {
      setPasswordError("Password must include at least one number");
      return false;
    }
    if (!hasSpecialChar) {
      setPasswordError("Password must include at least one special character (!@#$%^&*)");
      return false;
    }

    setPasswordError(null);
    return true;
  };

  if (!validatePassword(formData.password)) {
    return;
  }

  setLoading(true);
  console.log("Starting signup process with plan:", finalSelectedPlan);

  try {
    // Get user's IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          user_type: formData.jobTitle,
          airline: formData.airline,
          subscription_plan: finalSelectedPlan,
          last_ip_address: ip,
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        },
        emailRedirectTo: `${window.location.origin}/login#confirmation`
      }
    });

    if (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    console.log("Signup successful:", data);

    // Send confirmation email using our edge function
    const confirmationUrl = `${window.location.origin}/login#confirmation`;
    const emailResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          confirmationUrl,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Error sending confirmation email:", await emailResponse.text());
    }

    toast({
      title: "Welcome to SkyGuide!",
      description: "We've sent you a confirmation email. Please check your inbox and click the confirmation link to activate your account.",
    });
    navigate('/login');
    
  } catch (error) {
    console.error("Error in signup process:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};