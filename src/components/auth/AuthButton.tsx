import React from "react";
import { Button } from "../ui/button";
interface AuthButtonProps {
  loading: boolean;
  loadingText?: string;
  defaultText: string;
  className?: string;
}
const AuthButton: React.FC<AuthButtonProps> = ({
  loading,
  loadingText = "Submitting...",
  defaultText,
  className = "",
}) => {
  return (
    <Button
      type="submit"
      className={`w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-all duration-200 h-11 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
          <span>{loadingText}...</span>
        </div>
      ) : (
        defaultText
      )}
    </Button>
  );
};

export default AuthButton;
