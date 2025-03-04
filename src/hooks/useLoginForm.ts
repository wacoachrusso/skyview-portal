import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { handleEmailVerification } from "@/utils/authUtils";
import { useLoginFormState } from "./useLoginFormState";
import { checkExistingProfile, checkExistingSessions, updateLoginAttempts, resetLoginAttempts } from "@/services/loginService";

const MAX_LOGIN_ATTEMPTS = 3;
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const { loading, setLoading, showPassword, setShowPassword, formData, setFormData } = useLoginFormState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await supabase.auth.signOut();

      const profileData = await checkExistingProfile(formData.email);
      if (profileData?.account_status === 'locked') {
        toast({ variant: "destructive", title: "Account locked", description: "Too many failed login attempts." });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        if (profileData) {
          const newAttempts = (profileData.login_attempts || 0) + 1;
          const newStatus = newAttempts >= MAX_LOGIN_ATTEMPTS ? 'locked' : 'active';
          await updateLoginAttempts(formData.email, newAttempts, newStatus);
        }
        toast({ variant: "destructive", title: "Login failed", description: "Incorrect email or password." });
        return;
      }

      if (!data.session) throw new Error("No session created");

      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        await handleEmailVerification(formData.email);
        toast({ variant: "destructive", title: "Email not verified", description: "Check your inbox." });
        return;
      }

      await createNewSession(data.session.user.id);

      if (formData.rememberMe) {
        const refreshToken = localStorage.getItem('supabase.refresh-token');
        if (refreshToken) {
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; secure; samesite=strict; max-age=${SESSION_DURATION}`;
        }
      }

      await resetLoginAttempts(formData.email);
      navigate('/chat');

      toast({ title: "Welcome back!", description: "You have successfully logged in." });

    } catch (error) {
      toast({ variant: "destructive", title: "Login failed", description: "An unexpected error occurred." });
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
    handleSubmit
  };
};
