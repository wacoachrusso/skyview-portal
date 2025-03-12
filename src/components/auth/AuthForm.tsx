import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { AuthFormFooter } from "./AuthFormFooter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSignup } from "@/hooks/useSignup";
import { useSignupForm } from "@/hooks/useSignupForm";
import { useGoogleAuth } from "@/hooks/useGoogleAuth"; // Import the useGoogleAuth hook

interface AuthFormProps {
  selectedPlan?: string;
}

export const AuthForm = ({ selectedPlan }: AuthFormProps) => {
  const location = useLocation();
  const {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    passwordError,
  } = useSignupForm();

  const { loading, handleSignupSubmit } = useSignup();
  const { session } = useGoogleAuth(); // Get the session from useGoogleAuth

  const stateSelectedPlan = location.state?.selectedPlan;
  const statePriceId = location.state?.priceId;
  const finalSelectedPlan = selectedPlan || stateSelectedPlan || "free";

  // Check if the user is signed in with Google
  const isGoogleSignIn = !!session?.user; // If session exists, the user signed in with Google

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use email and full name from the session if the user signed in with Google
    const email = isGoogleSignIn ? session.user.email : formData.email;
    const fullName = isGoogleSignIn
      ? session.user.user_metadata?.full_name || session.user.user_metadata?.name
      : formData.fullName;

    console.log("Submitting form with data:", {
      email,
      fullName,
      jobTitle: formData.jobTitle,
      airline: formData.airline,
      plan: finalSelectedPlan,
    });

    handleSignupSubmit(
      {
        ...formData,
        email,
        fullName,
      },
      finalSelectedPlan,
      statePriceId,
      isGoogleSignIn // Pass isGoogleSignIn flag
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthFormHeader />
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Only show job role and airline selection for Google sign-in */}
            {isGoogleSignIn ? (
              <>
                <AuthFormFields
                  formData={formData}
                  showPassword={showPassword}
                  setFormData={setFormData}
                  setShowPassword={setShowPassword}
                  isGoogleSignIn={isGoogleSignIn} // Pass isGoogleSignIn to AuthFormFields
                />
              </>
            ) : (
              <>
                <AuthFormFields
                  formData={formData}
                  showPassword={showPassword}
                  setFormData={setFormData}
                  setShowPassword={setShowPassword}
                  isGoogleSignIn={isGoogleSignIn} // Pass isGoogleSignIn to AuthFormFields
                />
              </>
            )}

            {passwordError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-10 px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading
                ? isGoogleSignIn
                  ? "Creating Profile..."
                  : "Signing up..."
                : isGoogleSignIn
                ? "Create Profile"
                : "Sign Up"}
            </button>
          </form>

          <AuthFormFooter />
        </div>
      </div>
    </div>
  );
};