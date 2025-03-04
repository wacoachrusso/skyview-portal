import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useLoginForm } from "@/hooks/useLoginForm";
import { Link, useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const {
    loading,
    showPassword,
    formData,
    setShowPassword,
    setFormData,
    handleSubmit
  } = useLoginForm();
  const navigate = useNavigate();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GoogleSignInButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 text-gray-400 bg-[#1A1F2C]">Or continue with email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-200">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-white/5 border-white/10 text-white h-10"
            required
            autoComplete="email"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-gray-200">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white/5 border-white/10 text-white pr-10 h-10"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, rememberMe: checked as boolean })
              }
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-200 cursor-pointer">
              Stay logged in
            </Label>
          </div>
          <Button
            type="button"
            variant="link"
            className="text-brand-gold hover:text-brand-gold/80 text-sm px-0"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold h-11"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/#pricing-section" className="text-brand-gold hover:text-brand-gold/80 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};
