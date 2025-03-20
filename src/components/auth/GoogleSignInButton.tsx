
import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useState, useEffect } from "react";

export const GoogleSignInButton = () => {
  const { handleGoogleSignIn, loading } = useGoogleAuth();
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  
  // More robust click handling
  const handleClick = (e: React.MouseEvent) => {
    console.log("Google sign-in button clicked");
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Prevent event bubbling
    handleGoogleSignIn();
  };

  // Ensure the button is accessible
  useEffect(() => {
    const button = document.querySelector('button[type="button"]');
    if (button) {
      button.setAttribute('tabindex', '0');
    }
  }, []);
  
  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full border-white/20 text-white hover:bg-white/10 hover:text-white active:scale-95 transition-all z-10 ${isPressed ? 'bg-white/10 scale-95' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
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
