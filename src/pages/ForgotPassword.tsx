
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to reset your password."
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Initiating password reset for:", email);
      
      // Generate clean base URL
      const baseUrl = window.location.origin.replace(/:\/?$/, '');
      const resetUrl = `${baseUrl}/reset-password`;
      
      console.log("Reset URL that will be used:", resetUrl);
      
      // Use Supabase's built-in password reset function
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: resetUrl
      });

      if (error) throw error;
      
      console.log("Password reset email sent successfully");
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link."
      });
      navigate('/login');
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send password reset email. Please try again."
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
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="mt-2 text-sm text-gray-400 text-center">
              Enter your email address below to begin the password reset process
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-gray-200">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-10"
                required
                placeholder="Enter your email"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold h-11"
              disabled={loading}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Remember your password?{" "}
              <Button
                variant="link"
                className="text-brand-gold hover:text-brand-gold/80 p-0"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
