import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignUp() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 mt-4 sm:mt-6"
          aria-label="Back to home page"
        >
          <ArrowLeft size={isMobile ? 16 : 18} />
          <span>Back to Home</span>
        </Link>
        
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
            alt="SkyGuide Logo"
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Join SkyGuide
          </h1>
          <p className="text-sm text-gray-400">
            Create your account and start exploring
          </p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
}