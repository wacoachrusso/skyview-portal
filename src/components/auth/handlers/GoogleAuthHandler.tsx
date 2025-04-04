
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createNewSession } from "@/services/session";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export const GoogleAuthHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("GoogleAuthHandler: Processing callback...");

        // Prevent auth-related redirects during processing
        localStorage.setItem('login_in_progress', 'true');
        sessionStorage.setItem('recently_signed_up', 'true');
        
        // Get the session to verify the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("No session found:", sessionError || "Session is null");
          setError("Failed to authenticate with Google. Please try again.");
          navigate("/login?error=Authentication failed. Please try again.", { replace: true });
          return;
        }

        console.log("GoogleAuthHandler: User authenticated with ID:", session.user.id);
        
        // Set session tokens in cookies for persistence
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load your profile. Please try again.");
          localStorage.removeItem('login_in_progress');
          navigate("/login?error=Profile error. Please try again.", { replace: true });
          return;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log("GoogleAuthHandler: No profile found, creating new profile");

          const fullName = session.user.user_metadata.full_name || 
                          session.user.user_metadata.name || 
                          session.user.email;

          // See if we can find an assistant for the user
          let assistantId = null;
          // Default to first available assistant
          const { data: defaultAssistant } = await supabase
            .from("openai_assistants")
            .select("assistant_id")
            .eq("is_active", true)
            .limit(1)
            .single();
            
          assistantId = defaultAssistant?.assistant_id;

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              subscription_plan: 'free',
              account_status: 'active',
              query_count: 0,
              login_attempts: 0,
              email_notifications: true,
              push_notifications: true,
              assistant_id: assistantId
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            setError("Failed to create your profile. Please try again.");
            localStorage.removeItem('login_in_progress');
            navigate("/login?error=Profile creation failed. Please try again.", { replace: true });
            return;
          }

          // Set flag for new signup
          localStorage.setItem('new_user_signup', 'true');
          sessionStorage.setItem('recently_signed_up', 'true');
          
          // Create session
          await createNewSession(session.user.id);
          
          toast({ 
            title: "Account Created", 
            description: "Your account has been created successfully." 
          });
          
          // Send welcome email
          try {
            const { error: emailError } = await supabase.functions.invoke('send-free-trial-welcome', {
              body: { 
                email: session.user.email,
                name: fullName
              }
            });

            if (emailError) {
              console.error("Error sending welcome email:", emailError);
            } else {
              console.log("Welcome email sent successfully");
            }
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Continue regardless of email error
          }
          
          // Remove login processing flag
          localStorage.removeItem('login_in_progress');
          
          // Redirect to chat
          navigate("/chat", { replace: true });
          return;
        }

        console.log("GoogleAuthHandler: Existing profile found, proceeding to login");

        // Create session and redirect
        await createNewSession(session.user.id);
        localStorage.removeItem('login_in_progress');
        
        toast({ 
          title: "Sign In Successful", 
          description: "Welcome back!" 
        });
        
        // Check if user is admin and redirect to admin dashboard
        if (profile.is_admin) {
          console.log("Admin user detected, redirecting to admin dashboard");
          // Store admin status in localStorage for quick access
          localStorage.setItem('user_is_admin', 'true');
          navigate("/admin", { replace: true });
        } else {
          // Ensure admin flag is removed for non-admin users
          localStorage.removeItem('user_is_admin');
          
          // Set flag to prevent pricing redirects
          sessionStorage.setItem('recently_signed_up', 'true');
          
          navigate("/chat", { replace: true });
        }

      } catch (error) {
        console.error("GoogleAuthHandler: Unexpected error in auth callback", error);
        localStorage.removeItem('login_in_progress');
        setError("An unexpected error occurred. Please try again.");
        navigate("/login?error=Unexpected error. Please try again.", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-red-400 text-center">Authentication Failed</h2>
          <p className="mt-2 text-gray-300 text-center">{error}</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/login")}>Return to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-300">Authenticating with Google...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
      <p className="text-gray-300">Authentication successful! Redirecting...</p>
    </div>
  );
};
