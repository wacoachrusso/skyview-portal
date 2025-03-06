// File: src/hooks/useLoginForm.ts
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { handleEmailVerification } from "@/utils/authUtils";
import { useLoginFormState } from "./useLoginFormState";
import { checkExistingProfile, checkExistingSessions, updateLoginAttempts, resetLoginAttempts } from "@/services/loginService";

const MAX_LOGIN_ATTEMPTS = 3;
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

type UseLoginFormProps = {
  onNewLogin: () => Promise<void>; // Add onNewLogin prop
};

export const useLoginForm = ({ onNewLogin }: UseLoginFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNewSession } = useSessionManagement();
  const { loading, setLoading, showPassword, setShowPassword, formData, setFormData } = useLoginFormState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // Log out existing session before proceeding with new login
      await onNewLogin();

      const profileData = await checkExistingProfile(formData.email);
      if (profileData?.account_status === 'locked') {
        toast({ variant: "destructive", title: "Account locked", description: "Too many failed login attempts." });
        return;
      }

      // Sign in with email and password
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

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        await handleEmailVerification(formData.email);
        toast({ variant: "destructive", title: "Email not verified", description: "Check your inbox." });
        return;
      }

      // Delete existing sessions for the user from auth.sessions
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', data.session.user.id);

      if (sessionError) {
        console.error('Error deleting existing sessions:', sessionError);
      }

      // Create a new session
      await createNewSession(data.session.user.id);

      // Set remember-me cookie if enabled
      if (formData.rememberMe) {
        const refreshToken = localStorage.getItem('supabase.refresh-token');
        if (refreshToken) {
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; secure; samesite=strict; max-age=${SESSION_DURATION}`;
        }
      }

      // Reset login attempts and navigate to chat
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