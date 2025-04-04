
import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SignUp() {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <Link 
        to="/" 
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 mt-4 sm:mt-6"
        aria-label="Back to home page"
      >
        <ArrowLeft size={isMobile ? 16 : 18} />
        <span>Back to Home</span>
      </Link>
      <AuthForm />
    </div>
  );
}
