
import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export const GoogleSignInButton = () => {
  const { handleGoogleSignIn, loading } = useGoogleAuth();
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Connecting...</span>
        </div>
      ) : (
        <>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-4 h-4 mr-2"
          />
          Sign In with Google
        </>
      )}
    </Button>
  );
};
