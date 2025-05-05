import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { handlePasswordReset } from "@/utils/authUtils";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthLayout from "@/components/auth/AuthLayout";

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
        description:
          "We've sent you a password reset link. Please check both your inbox and spam folder.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMsg(
        "Could not send password reset email. Please ensure you've entered the correct email and try again, or contact support if the issue persists."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address below to begin the password reset process."
      className='max-w-md'
    >
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
              We've sent a password reset link to{" "}
              <span className="font-semibold">{email}</span>. Please check your
              inbox and spam folder.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-gray-400">
            Didn't receive the email? Check your spam folder or try again in a
            few minutes.
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
              onClick={() => navigate("/login")}
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
              className="bg-background border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c] py-6"
              required
              placeholder="Enter your email"
            />
          </div>

          <AuthButton
            loading={loading}
            loadingText="Sending Reset Link"
            defaultText="Send Reset Link"
          />
          <AuthFooter
            bottomText="Remember your password?"
            bottomLinkText="Back to Login"
            bottomLinkTo="/login"
          />
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
