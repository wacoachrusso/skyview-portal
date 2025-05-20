import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { JobAndAirlineSelector } from "@/components/auth/JobAndAirlineSelector";
import { createNewSession } from "@/services/session";

const infoFormSchema = z.object({
  jobTitle: z.string().min(1, "Please select a job title."),
  airline: z.string().min(1, "Please select an airline."),
});

type InfoFormValues = z.infer<typeof infoFormSchema>;

// Add new props to accept user information directly from GoogleAuthHandler
interface GoogleAuthMissingInfoHandlerProps {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userProfile: any;
  isNewUser: boolean;
}

export const GoogleAuthMissingInfoHandler = ({
  userId: providedUserId,
  userEmail: providedUserEmail,
  userName: providedUserName,
  userProfile: providedUserProfile,
  isNewUser: providedIsNewUser = false
}: GoogleAuthMissingInfoHandlerProps = {
  userId: null,
  userEmail: null,
  userName: null,
  userProfile: null,
  isNewUser: false
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(providedUserId);
  const [userEmail, setUserEmail] = useState<string | null>(providedUserEmail);
  const [userName, setUserName] = useState<string | null>(providedUserName);
  const [isDirectAccess, setIsDirectAccess] = useState(providedUserId === null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<InfoFormValues>({
    resolver: zodResolver(infoFormSchema),
    defaultValues: {
      jobTitle: "",
      airline: "",
    },
  });

  // Function to fetch user profile directly
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      // Set admin status in localStorage for quick access
      if (profile.is_admin) {
        localStorage.setItem("user_is_admin", "true");
      } else {
        localStorage.removeItem("user_is_admin");
      }

      // Store profile and name in localStorage
      localStorage.setItem("user_profile", JSON.stringify(profile));
      localStorage.setItem("auth_user_name", profile.full_name);

      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };
  
  // Function to handle the pricing section redirect
  const handlePricingRedirect = () => {
    // Check if we're being redirected to pricing section
    const urlParams = new URLSearchParams(window.location.search);
    const scrollToSection = urlParams.get('scrollTo');
    
    if (scrollToSection === 'pricing-section') {
      console.log("Blocking navigation to pricing section during profile setup");
      
      // Remove the query parameter and stay on the current page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Show a toast notification
      toast({
        variant: "destructive",
        title: "Profile Setup Required",
        description: "Please complete your profile before continuing."
      });
      
      return true; // Redirect was detected and handled
    }
    
    return false; // No redirect detected
  };

  useEffect(() => {
    // Check for pricing redirect when component mounts
    handlePricingRedirect();
    
    // Setup event listener for URL changes
    const handleUrlChange = () => {
      handlePricingRedirect();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    // Add a beforeunload event to prevent the user from closing the tab/window
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if profile completion is required
      if (sessionStorage.getItem('block_navigation_until_profile_complete') === 'true' || 
          !isDirectAccess) { // Also block if coming directly from auth handler
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [toast, isDirectAccess]);

  useEffect(() => {
    // If we already have user information, we can skip additional checks
    if (userId && userEmail) {
      console.log("GoogleAuthMissingInfoHandler: Using provided user information");
      setLoading(false);
      return;
    }

    const checkUserInfo = async () => {
      try {
        setLoading(true);
        console.log("GoogleAuthMissingInfoHandler: Checking user information...");

        // Check for any unwanted redirects first
        handlePricingRedirect();

        // Otherwise, check session and profile as normal
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("No session found:", sessionError || "Session is null");
          setError("Authentication error. Please try again.");
          localStorage.removeItem('login_in_progress');
          sessionStorage.removeItem('block_navigation_until_profile_complete');
          navigate("/login?error=Authentication failed. Please try again.", { replace: true });
          return;
        }

        console.log("GoogleAuthMissingInfoHandler: User authenticated with ID:", session.user.id);
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        setUserName(session.user.user_metadata.full_name || 
                    session.user.user_metadata.name || 
                    session.user.email);
        
        // Set flag to indicate we're coming from direct access (not from auth handler)
        setIsDirectAccess(true);
        
        // Check if user profile exists and has job title and airline
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load your profile. Please try again.");
          sessionStorage.removeItem('block_navigation_until_profile_complete');
          navigate("/login?error=Profile error. Please try again.", { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("GoogleAuthMissingInfoHandler: Unexpected error", error);
        setError("An unexpected error occurred. Please try again.");
        localStorage.removeItem('login_in_progress');
        sessionStorage.removeItem('block_navigation_until_profile_complete');
        navigate("/login?error=Unexpected error. Please try again.", { replace: true });
        setLoading(false);
      }
    };

    // Only run the check if we don't already have user information
    if (!providedUserId) {
      checkUserInfo();
    }
  }, [navigate, toast, providedUserId, providedUserEmail, userId, userEmail]);

  const onSubmit = async (data: InfoFormValues) => {
    try {
      setSubmitting(true);
      
      if (!userId) {
        setError("User ID not found. Please try logging in again.");
        return;
      }

      // Update the profile with the new information
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: data.jobTitle,
          airline: data.airline
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setError("Failed to update your profile information. Please try again.");
        return;
      }

      // Create session if needed (for direct access cases)
      if (isDirectAccess) {
        await createNewSession(userId);
      }
      
      // Fetch updated user profile
      await fetchUserProfile(userId);
      
      toast({ 
        title: "Information Updated", 
        description: "Your profile information has been saved." 
      });
      
      localStorage.removeItem('login_in_progress');
      sessionStorage.removeItem('block_navigation_until_profile_complete'); // Clear flag once profile is complete
      
      // Redirect to chat
      window.location.href = "/chat";
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-red-400 text-center">Error</h2>
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
        <p className="mt-4 text-gray-300">Checking your account information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
      <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          {providedIsNewUser ? "Complete Your Profile" : "Update Your Profile"}
        </h2>
        <p className="mb-6 text-gray-300 text-center">
          {providedIsNewUser 
            ? "Please provide some additional information to complete your account setup."
            : "Please update your profile information to continue."}
        </p>
        
        {/* Added warning message */}
        <div className="mb-6 p-3 bg-amber-900/50 border border-amber-500/50 rounded-md">
          <p className="text-amber-300 text-sm">
            <strong>Important:</strong> You must complete your profile before you can access the application.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <JobAndAirlineSelector form={form} />
            
            <Button 
              type="submit"
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black font-medium py-2 px-4 rounded-md"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                providedIsNewUser ? "Complete Profile" : "Update Profile"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};