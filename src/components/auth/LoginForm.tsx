import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LoginForm = () => {
  const {
    loading,
    showPassword,
    formData,
    setShowPassword,
    setFormData,
    handleSubmit
  } = useLoginForm();

  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to reset your password."
      });
      return;
    }

    setResetLoading(true);
    try {
      console.log('Starting password reset process for:', formData.email);
      
      // Send custom email using our Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: formData.email.trim(),
          resetUrl: `${window.location.origin}/auth/callback?type=recovery`
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link."
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send password reset email. Please try again."
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GoogleSignInButton />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 text-gray-400 bg-gray-900/50">Or continue with email</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-gray-200">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white/10 border-white/20 text-white text-sm sm:text-base h-9 sm:h-10"
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
            className="bg-white/10 border-white/20 text-white pr-10 text-sm sm:text-base h-9 sm:h-10"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
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
            className="border-white/20 h-4 w-4"
          />
          <Label htmlFor="rememberMe" className="text-sm text-gray-200 cursor-pointer">
            Stay logged in
          </Label>
        </div>
        <Button
          type="button"
          variant="link"
          className="text-brand-gold hover:text-brand-gold/80 text-sm"
          onClick={handleForgotPassword}
          disabled={resetLoading}
        >
          {resetLoading ? "Sending reset link..." : "Forgot password?"}
        </Button>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-9 sm:h-10 text-sm sm:text-base"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};