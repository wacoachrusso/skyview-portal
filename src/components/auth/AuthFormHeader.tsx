import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const AuthFormHeader = () => {
  return (
    <>
      <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-6 flex justify-center">
        <img 
          src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
          alt="SkyGuide Logo" 
          className="h-12 w-auto"
        />
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">Create Account</h1>
      <p className="text-gray-400 text-center mb-6">Enter your details to get started</p>
    </>
  );
};