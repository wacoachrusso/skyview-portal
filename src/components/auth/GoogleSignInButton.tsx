import { Button } from "@/components/ui/button";

export const GoogleSignInButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
      onClick={() => {
        // Google sign-in logic
      }}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        className="w-4 h-4 mr-2"
      />
      Sign In with Google
    </Button>
  );
};
