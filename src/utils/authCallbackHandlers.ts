import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

interface AuthCallbackHandlerProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
  handleSession: () => Promise<void>;
}

export const handleGoogleSignIn = async ({ navigate, toast, handleSession }: AuthCallbackHandlerProps) => {
  console.log('Processing Google sign-in callback');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    await supabase.auth.signOut();
    navigate('/login');
    return;
  }

  if (!session?.user) {
    console.error('No valid session found after Google sign-in');
    navigate('/login');
    return;
  }

  // Check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    console.log('No profile found for Google user, signing out');
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Account Required",
      description: "Please sign up for an account before signing in with Google."
    });
    navigate('/signup');
    return;
  }

  console.log('Google sign-in successful, redirecting to dashboard');
  await handleSession();
  navigate('/dashboard');
};

export const handleEmailSignIn = async ({ navigate, toast, handleSession }: AuthCallbackHandlerProps) => {
  console.log('Processing email sign-in callback');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    await supabase.auth.signOut();
    navigate('/login');
    return;
  }

  if (!session) {
    console.error('No session found');
    navigate('/login');
    return;
  }

  await handleSession();
  navigate('/dashboard');
};

export const handlePasswordRecovery = (token: string | null, navigate: NavigateFunction) => {
  if (token) {
    navigate(`/reset-password?token=${token}`);
    return true;
  }
  return false;
};

export const handleEmailChange = async (
  searchParams: URLSearchParams,
  navigate: NavigateFunction,
  EmailConfirmationHandler: any
) => {
  const { processEmailConfirmation } = EmailConfirmationHandler({ searchParams });
  const success = await processEmailConfirmation();
  if (success) {
    navigate('/settings');
    return true;
  }
  navigate('/login');
  return false;
};
