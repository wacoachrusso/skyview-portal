
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  onSubmit: (email: string, password?: string, rememberMe?: boolean) => Promise<void>;
  loading: boolean;
}

export const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, rememberMe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-gray-200">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-10"
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm text-gray-200">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs text-brand-gold hover:text-brand-gold/80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-10 pr-10"
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-white/30 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
          />
          <label 
            htmlFor="rememberMe" 
            className="text-sm text-gray-300 cursor-pointer"
          >
            Stay logged in for 30 days
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold h-11"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-luxury-dark text-gray-400">OR</span>
        </div>
      </div>

      <GoogleSignInButton />

      <div className="text-center mt-4">
        <span className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand-gold hover:text-brand-gold/80 transition-colors">
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
};
