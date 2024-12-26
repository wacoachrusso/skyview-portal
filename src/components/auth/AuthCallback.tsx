import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was an error signing in. Please try again."
          });
          navigate('/login');
          return;
        }

        if (session) {
          console.log('Session established:', session.user.id);
          console.log('Provider:', session.user.app_metadata.provider);
          
          // Check if profile is complete
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, airline')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          // For Google auth, we might need to create/update the profile
          if (session.user.app_metadata.provider === 'google') {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', session.user.id)
              .single();

            if (!existingProfile?.full_name) {
              // Update profile with Google user's name
              await supabase
                .from('profiles')
                .update({
                  full_name: session.user.user_metadata.full_name
                })
                .eq('id', session.user.id);
            }
          }

          if (profile?.user_type && profile?.airline) {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in."
            });
            navigate('/dashboard');
          } else {
            navigate('/complete-profile');
          }
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
};