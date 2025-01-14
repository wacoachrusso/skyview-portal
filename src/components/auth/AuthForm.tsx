import { useLocation } from "react-router-dom";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormFields } from "./AuthFormFields";
import { AuthFormFooter } from "./AuthFormFooter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSignup } from "@/hooks/useSignup";
import { useSignupForm } from "@/hooks/useSignupForm";

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

  const {
    loading,
    handleSignupSubmit,
  } = useSignup();

  const stateSelectedPlan = location.state?.selectedPlan;
  const statePriceId = location.state?.priceId;
  const finalSelectedPlan = selectedPlan || stateSelectedPlan || 'free';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting signup form with data:', {
      email: formData.email,
      fullName: formData.fullName,
      jobTitle: formData.jobTitle,
      airline: formData.airline,
      plan: finalSelectedPlan,
      priceId: statePriceId
    });
    
    handleSignupSubmit(formData, finalSelectedPlan, statePriceId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthFormHeader />
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields 
              formData={formData}
              showPassword={showPassword}
              setFormData={setFormData}
              setShowPassword={setShowPassword}
            />

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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <AuthFormFooter />
        </div>
      </div>
    </div>
  );
};