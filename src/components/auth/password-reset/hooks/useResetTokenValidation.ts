
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ValidationState {
  isValidating: boolean;
  isError: boolean;
  errorMessage: string;
  isValid: boolean;
}

export const useResetTokenValidation = () => {
  const [searchParams] = useSearchParams();
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: true,
    isError: false,
    errorMessage: "The password reset link is invalid or has expired. Please request a new link.",
    isValid: false
  });

  useEffect(() => {
    const validateResetLink = async () => {
      try {
        // Log all search params for debugging
        const paramEntries = Object.fromEntries(searchParams.entries());
        console.log("URL search params:", paramEntries);
        
        // Check for token/code in the URL
        const type = searchParams.get("type");
        const code = searchParams.get("code");
        
        if (type !== "recovery") {
          console.error("Not a recovery flow, type:", type);
          setValidationState({
            isValidating: false,
            isError: true,
            errorMessage: "Invalid reset link. Please request a new password reset link.",
            isValid: false
          });
          return;
        }
        
        // Validate that we have a code parameter (needed for password reset)
        if (!code) {
          console.error("Missing code parameter in URL");
          setValidationState({
            isValidating: false,
            isError: true,
            errorMessage: "This reset link is incomplete. Please request a new password reset link.",
            isValid: false
          });
          return;
        }
        
        // We need to get the user's email from the URL too, as it's required for OTP verification
        const email = searchParams.get("email");
        if (!email) {
          console.error("Missing email parameter in URL");
          setValidationState({
            isValidating: false,
            isError: true,
            errorMessage: "This reset link is missing required information. Please request a new password reset link.",
            isValid: false
          });
          return;
        }
        
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token: code,
          email: email
        });
        
        if (error) {
          console.error("Error verifying recovery token:", error);
          setValidationState({
            isValidating: false,
            isError: true,
            errorMessage: "The password reset link is invalid or has expired. Please request a new link.",
            isValid: false
          });
          return;
        }
        
        console.log("Token validation complete, ready for password reset");
        setValidationState({
          isValidating: false,
          isError: false,
          errorMessage: "",
          isValid: true
        });
      } catch (error) {
        console.error("Error validating reset link:", error);
        setValidationState({
          isValidating: false,
          isError: true,
          errorMessage: "An error occurred while validating the reset link. Please try again or request a new link.",
          isValid: false
        });
      }
    };

    validateResetLink();
  }, [searchParams]);

  return validationState;
};
