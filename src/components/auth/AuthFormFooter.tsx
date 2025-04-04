
import { Link } from "react-router-dom";

interface AuthFormFooterProps {
  isLogin?: boolean;
}

export const AuthFormFooter = ({ isLogin = false }: AuthFormFooterProps) => {
  return (
    <p className="mt-6 text-center text-sm sm:text-base text-gray-400">
      {isLogin ? (
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand-gold hover:text-brand-gold/80 font-medium">
            Sign up
          </Link>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-brand-gold hover:text-brand-gold/80 font-medium">
            Login
          </Link>
        </>
      )}
    </p>
  );
};
