
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/**
 * Component that handles authentication callbacks from OAuth providers
 * or email magic links. It processes the callback parameters and redirects
 * the user to the appropriate page.
 */
export default function AuthCallbackHandler() {
  const navigate = useNavigate();
  const { handleCallback } = useAuthCallback();

  useEffect(() => {
    const processCallback = async () => {
      await handleCallback();
    };

    processCallback();
  }, [navigate, handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-background to-brand-slate">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white text-lg">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
