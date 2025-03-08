
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkExistingProfile, checkExistingSessions, updateLoginAttempts, resetLoginAttempts } from "@/services/loginService";
import { useToast } from "@/hooks/use-toast";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type UseLoginFormProps = {
  onNewLogin: () => Promise<void>;
};

export const useLoginForm = ({ onNewLogin }: UseLoginFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login for user:", formData.email);
      
      // Check if user exists and account status
      const profile = await checkExistingProfile(formData.email);
      
      // If account is disabled, suspended, or deleted, block login
      if (profile?.account_status === "disabled" || profile?.account_status === "suspended" || profile?.account_status === "deleted") {
        console.log(`Login blocked due to account status: ${profile.account_status}`);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: `Your account has been ${profile.account_status}. Please contact support.`,
        });
        setLoading(false);
        return;
      }
      
      // Check for too many login attempts
      if (profile?.login_attempts && profile.login_attempts >= 5) {
        console.log("Login blocked due to too many attempts");
        // Disable account after 5 failed attempts
        await updateLoginAttempts(formData.email, profile.login_attempts, "disabled");
        toast({
          variant: "destructive",
          title: "Account Locked",
          description: "Too many failed login attempts. Your account has been disabled.",
        });
        setLoading(false);
        return;
      }

      // Attempt login
      await onNewLogin(); // Sign out existing sessions first
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Increment login attempts on failure
        if (profile) {
          const newAttempts = (profile.login_attempts || 0) + 1;
          await updateLoginAttempts(formData.email, newAttempts, profile.account_status || 'active');
          
          const remainingAttempts = 5 - newAttempts;
          if (remainingAttempts > 0) {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: `Incorrect password. ${remainingAttempts} attempts remaining before your account is locked.`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Account Locked",
              description: "Too many failed login attempts. Your account has been disabled.",
            });
          }
        } else {
          toast({
            variant: "destructive",
              title: "Login Failed", 
              description: "Invalid email or password",
            });
        }
        
        setLoading(false);
        return;
      }

      console.log("Login successful, user data:", data);
      
      // Reset login attempts on successful login
      if (profile) {
        await resetLoginAttempts(formData.email);
      }

      // Ensure user profile data is refreshed after login
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log("Fetched updated user profile after login:", userData);

      // Force refresh of session to ensure all profile data is current
      await supabase.auth.refreshSession();
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Check for existing sessions
      if (profile) {
        const existingSessions = await checkExistingSessions(profile.id);
        if (existingSessions && existingSessions.length > 0) {
          console.log(`User has ${existingSessions.length} existing sessions`);
        }
      }

      // Decide where to redirect based on admin status
      if (userData?.is_admin) {
        console.log("User is an admin, redirecting to admin dashboard");
        navigate("/admin");
      } else {
        // Regular user flow - check profile completeness
        if (userData?.user_type && userData?.airline) {
          console.log("Profile complete, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("Profile incomplete, redirecting to account page");
          navigate("/account");
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    showPassword,
    formData,
    setShowPassword,
    setFormData,
    handleSubmit,
  };
};
