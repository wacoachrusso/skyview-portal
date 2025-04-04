import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TestSignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    if (loading) return;
    
    setLoading(true);
    const timestamp = new Date().getTime();
    const testEmail = `testuser${timestamp}@example.com`;
    
    console.log("Starting test signup with:", {
      email: testEmail,
      fullName: "Test User",
      jobTitle: "flight attendant",
      airline: "american airlines"
    });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "MyTestPassword123!",
        options: {
          data: {
            full_name: "Test User",
            user_type: "flight attendant",
            airline: "american airlines",
            subscription_plan: "free"
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
          });
          navigate('/login');
          return;
        }

        throw error;
      }

      console.log("Test signup successful:", data);
      
      toast({
        title: "Success",
        description: "Test account created. Please check your email to verify your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error in testSignUp:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during signup",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Test Sign Up</h1>
          <button
            onClick={testSignUp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-10 px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up Test User"}
          </button>
        </div>
      </div>
    </div>
  );
};