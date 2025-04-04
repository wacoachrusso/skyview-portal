
import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  isLogin?: boolean;
  onToggle?: () => void;
}

export const AuthFormFooter = ({ isLogin = false, onToggle }: AuthFormFooterProps) => {
  return (
    <p className="mt-6 text-center text-sm sm:text-base text-gray-400">
      {isLogin ? (
        <>
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={onToggle} 
            className="text-brand-gold hover:text-brand-gold/80 font-medium"
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button 
            type="button"
            onClick={onToggle} 
            className="text-brand-gold hover:text-brand-gold/80 font-medium"
          >
            Login
          </button>
        </>
      )}
    </p>
  );
};
