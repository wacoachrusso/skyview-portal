
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function GoogleAuthHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log("Handling OAuth callback");
        setLoading(true);

        // 1. Get session from URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw new Error("Failed to get session");
        }

        if (!data.session) {
          console.log("No session found in callback");
          throw new Error("No session found");
        }

        console.log("Session found:", data.session.user.id);

        // 2. Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error("Error fetching profile");
        }

        // 3. Create a session token
        try {
          const { createNewSession } = await import('@/services/sessionService');
          await createNewSession(data.session.user.id);
          console.log("Created new session token after login");
        } catch (sessionError) {
          console.error("Error creating session:", sessionError);
          throw new Error("Error creating session");
        }

        // 4. Direct user based on profile status
        if (profile?.user_type && profile?.airline) {
          // Profile is complete
          console.log("Profile complete, redirecting to chat");
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate('/chat', { replace: true });
        } else if (profile) {
          // Profile exists but incomplete
          console.log("Profile incomplete, redirecting to account page");
          navigate('/account', { replace: true });
        } else {
          // No profile, redirect to account to complete profile
          console.log("No profile found, redirecting to account page");
          navigate('/account', { replace: true });
        }
      } catch (err) {
        console.error("Error in OAuth callback:", err);
        setError(err.message || "An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: err.message || "An unexpected error occurred during sign-in",
        });
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <div className="text-center glass-morphism rounded-2xl p-8 shadow-2xl border border-white/10">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-white text-lg">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <div className="text-center glass-morphism rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
