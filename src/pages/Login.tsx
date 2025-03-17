
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Login page mounted");
    checkSession();
  }, []);

  const checkSession = async () => {
    console.log("Checking user session...");
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      console.log("Session found, redirecting to dashboard");
      navigate("/dashboard");
    } else {
      console.log("Session check result: No session");
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "",
      });

      if (error) throw error;

      if (data.user) {
        // Check user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }

        // Redirect based on profile status
        if (profile?.account_status === "locked") {
          toast({
            variant: "destructive",
            title: "Account Locked",
            description: "Your account is locked. Please reset your password."
          });
          await supabase.auth.signOut();
          navigate('/forgot-password');
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in."
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-12 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-400 text-center">
              Sign in to your SkyGuide account
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-gold hover:text-brand-gold/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
