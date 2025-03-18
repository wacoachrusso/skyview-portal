
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { handlePasswordReset } from "@/utils/authUtils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!email.trim()) {
      setErrorMsg("Please enter your email address to reset your password.");
      return;
    }

    setLoading(true);
    try {
      console.log("Initiating password reset for:", email);
      
      const result = await handlePasswordReset(email);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to send reset email");
      }
      
      console.log("Password reset email sent successfully");
      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check both your inbox and spam folder."
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setErrorMsg("Could not send password reset email. Please ensure you've entered the correct email and try again, or contact support if the issue persists.");
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

          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <div className="text-center space-y-6">
              <Alert className="bg-green-500/10 text-green-400 border-green-500/20 mb-6">
                <Info className="h-4 w-4 text-green-400" />
                <AlertTitle className="text-green-400">Check your email</AlertTitle>
                <AlertDescription>
                  We've sent a password reset link to <span className="font-semibold">{email}</span>. 
                  Please check your inbox and spam folder.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
              
              <Button 
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold h-11"
                onClick={() => setEmailSent(false)}
              >
                Try Again
              </Button>
              
              <p className="text-center text-sm text-gray-400 mt-4">
                <Button
                  variant="link"
                  className="text-brand-gold hover:text-brand-gold/80 p-0"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
