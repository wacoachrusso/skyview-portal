import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as toastFunction } from "@/hooks/use-toast";

interface AuthCallbackProps {
  navigate: NavigateFunction;
  toast: typeof toastFunction;
}

export const checkSession = async ({ navigate, toast }: AuthCallbackProps) => {
  console.log("Starting auth callback process...");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session error:", sessionError);
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: "There was a problem with your session. Please try logging in again."
    });
    navigate('/login');
    return null;
  }

  if (!session) {
    console.log("No active session");
    toast({
      variant: "destructive",
      title: "Session Error",
      description: "No active session found. Please log in again."
    });
    navigate('/login');
    return null;
  }

  return session;
};

export const getCurrentUser = async ({ navigate, toast }: AuthCallbackProps) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user?.email) {
    console.error("Error getting user:", userError);
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: "Could not verify user identity. Please try again."
    });
    navigate('/login');
    return null;
  }

  return user;
};

export const signOutGlobally = async ({ navigate, toast }: AuthCallbackProps) => {
  console.log("Signing out all other sessions...");
  const { error: globalSignOutError } = await supabase.auth.signOut({ 
    scope: 'global'
  });
  
  if (globalSignOutError) {
    console.error("Error signing out other sessions:", globalSignOutError);
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Session Conflict",
      description: "Could not manage existing sessions. Please try again."
    });
    navigate('/login');
    return false;
  }
  return true;
};

export const reAuthenticateSession = async (
  provider: 'google',
  { navigate, toast }: AuthCallbackProps
) => {
  const { error: reAuthError } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (reAuthError) {
    console.error("Error re-authenticating:", reAuthError);
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: "Could not re-authenticate. Please try again."
    });
    navigate('/login');
    return false;
  }
  return true;
};

export const checkUserProfile = async (
  userId: string,
  { navigate, toast }: AuthCallbackProps
) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    await supabase.auth.signOut();
    toast({
      variant: "destructive",
      title: "Profile Error",
      description: "Could not fetch your profile. Please try again."
    });
    navigate('/login');
    return null;
  }

  return profile;
};