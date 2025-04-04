
import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Link 
        to="/" 
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
        aria-label="Back to home page"
      >
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>
      <AuthForm />
    </div>
  );
}
