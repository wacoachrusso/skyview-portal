import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthSession, handlePasswordReset } from "@/utils/auth/sessionHandler";
import { Icons } from "@/components/icons";
import { OAuthSignIn } from "@/components/auth/OAuthSignIn";
import { createNewSession, validateSessionToken } from "@/services/session";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
	const [searchParams] = useSearchParams();
	const next = searchParams.get("next") ?? "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
      } else {
        console.log("Login successful:", data);
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });

        if (data.user) {
          await handleAuthSession(data.user.id, createNewSession, navigate);
          navigate(next);
        }
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordResetting(true);

    if (!passwordResetEmail) {
      toast({
        variant: "destructive",
        title: "Reset Error",
        description: "Please enter your email address.",
      });
      setIsPasswordResetting(false);
      return;
    }

    const { success, error } = await handlePasswordReset(passwordResetEmail);

    if (success) {
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox to reset your password.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Reset Error",
        description: error || "Failed to send password reset email.",
      });
    }

    setIsPasswordResetting(false);
  };

  return (
    <div className="container grid h-screen w-screen place-items-center">
      <Card className="w-[400px] bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button disabled={loading} className="w-full mt-4" type="submit">
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <OAuthSignIn />
        </CardContent>
        <CardContent className="text-center">
          <Button
            variant="link"
            onClick={() => navigate("/register")}
            className="text-sm"
          >
            Don't have an account? Register
          </Button>
        </CardContent>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="grid gap-2">
            <Label htmlFor="reset-email">Forgot Password?</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                id="reset-email"
                placeholder="Enter your email"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
                required
                className="flex-grow"
              />
              <Button
                type="submit"
                disabled={isPasswordResetting}
                className="whitespace-nowrap"
              >
                {isPasswordResetting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
