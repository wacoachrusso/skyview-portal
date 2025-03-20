
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";
import { PasswordResetHandler } from "./handlers/PasswordResetHandler";
import { EmailConfirmationHandler } from "./handlers/EmailConfirmationHandler";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [callbackType, setCallbackType] = useState<string | null>(null);

  useEffect(() => {
    // Determine the type of callback based on URL parameters or pathname
    const searchParams = new URLSearchParams(location.search);
    const hash = location.hash;

    console.log("Auth callback: determining callback type");
    console.log("Search params:", searchParams.toString());
    console.log("Hash:", hash);
    console.log("Path:", location.pathname);

    // Check for Google OAuth callback (will have either access_token or error in hash fragment)
    if (hash.includes('access_token') || hash.includes('error')) {
      console.log("Detected Google OAuth callback");
      setCallbackType('google');
      return;
    }

    // Check for password reset
    if (searchParams.has('type') && searchParams.get('type') === 'recovery') {
      console.log("Detected password reset callback");
      setCallbackType('password-reset');
      return;
    }

    // Check for email confirmation
    if (searchParams.has('type') && searchParams.get('type') === 'signup') {
      console.log("Detected email confirmation callback");
      setCallbackType('email-confirmation');
      return;
    }

    // If we can't determine the type, redirect to login
    console.log("Unknown callback type, redirecting to login");
    navigate('/login', { replace: true });
  }, [location, navigate]);

  if (callbackType === null) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-white">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (callbackType === 'google') {
    return <GoogleAuthHandler />;
  }

  if (callbackType === 'password-reset') {
    return <PasswordResetHandler />;
  }

  if (callbackType === 'email-confirmation') {
    return <EmailConfirmationHandler />;
  }

  return null;
}
