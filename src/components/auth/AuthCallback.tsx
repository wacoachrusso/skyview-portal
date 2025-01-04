import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const provider = searchParams.get('provider');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== Processing Auth Callback ===');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('No session found');
          throw new Error('No session found');
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, redirecting to signup');
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Required",
            description: "Please sign up for an account and select a plan before signing in with Google."
          });
          navigate('/signup');
          return;
        }

        // Check profile status
        if (profile.account_status !== 'active') {
          console.log('Account not active:', profile.account_status);
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Not Active",
            description: "Your account is not active. Please contact support."
          });
          navigate('/login');
          return;
        }

        console.log('Auth callback successful, redirecting to dashboard');
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in."
        });
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem signing you in. Please try again."
        });
        navigate('/login');
      }
    };

    if (provider === 'google') {
      handleCallback();
    }
  }, [navigate, toast, provider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};