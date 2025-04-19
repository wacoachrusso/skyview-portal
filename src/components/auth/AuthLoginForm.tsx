import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNewSession } from "@/services/session";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface AuthLoginFormProps {
  redirectPath?: string;
}

export function AuthLoginForm({ redirectPath = "/chat" }: AuthLoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSession } = useSessionHandler();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);

    try {
      // Login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        setLoading(false);
        return;
      }

      if (authData.session) {
        // IMPORTANT: Set auth status immediately for instant UI updates
        localStorage.setItem('auth_status', 'authenticated');
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // If rememberMe is checked, set session expiry to 30 days
        if (rememberMe) {
          localStorage.setItem('extended_session', 'true');
        }
        
        await createNewSession(authData.session.user.id);
        
        // Redirect to the specified path or default to chat
        window.location.href = redirectPath;
        return; // Stop execution here
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card-gradient border border-white/10 shadow-xl backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">
            Sign In to Your Account
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Enter your credentials to access your account
            {redirectPath !== "/chat" && (
              <span className="block mt-1 text-brand-gold">
                {redirectPath === "/referral" ? "Sign in to access the referral program" : `Sign in to access ${redirectPath.replace('/', '')}`}
              </span>
            )}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      className="bg-background/30 border-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        className="bg-background/30 border-white/10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="border-white/30 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                      />
                      <label 
                        htmlFor="rememberMe" 
                        className="text-xs text-gray-300 cursor-pointer"
                      >
                        Stay logged in for 30 days
                      </label>
                    </div>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-brand-gold hover:text-brand-gold/80 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="px-3 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <GoogleSignInButton />
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link 
                  to={`/signup${redirectPath !== "/chat" ? `?redirectTo=${encodeURIComponent(redirectPath)}` : ""}`}
                  className="text-brand-gold hover:text-brand-gold/80 transition-colors"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}