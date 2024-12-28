import { Link } from "react-router-dom";

export const AuthFormFooter = () => {
  return (
    <p className="mt-6 text-center text-gray-400">
      Already have an account?{" "}
      <Link to="/login" className="text-brand-gold hover:text-brand-gold/80">
        Login
      </Link>
    </p>
  );
};