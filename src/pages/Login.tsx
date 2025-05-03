import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNewSession } from "@/services/session";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import "@/styles/auth-autofill.css";
const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
const Login = () => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // Store redirectTo path from state if it exists
  const redirectPath = location.state?.redirectTo || "/chat";
  // Function to fetch user profile directly
  const fetchUserProfile = async (userId: string) => {
    try {
      // Direct API call to fetch user profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      // Set admin status in localStorage for quick access
      if (profile.is_admin) {
        localStorage.setItem("user_is_admin", "true");
        console.log("Admin status set in localStorage: true");
      } else {
        localStorage.removeItem("user_is_admin");
        console.log("Admin status removed from localStorage");
      }

      // Store profile in localStorage for immediate access
      localStorage.setItem("user_profile", JSON.stringify(profile));

      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

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
        localStorage.setItem("auth_status", "authenticated");

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // If rememberMe is checked, set session expiry to 30 days
        if (rememberMe) {
          localStorage.setItem("extended_session", "true");
        }

        // Create new session
        await createNewSession(authData.session.user.id);

        // Fetch user profile directly before redirect
        await fetchUserProfile(authData.session.user.id);

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
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // Skip this check if we're already in login flow
      if (localStorage.getItem("login_in_progress") === "true") {
        setInitialCheckDone(true);
        return;
      }

      // Check if user is already logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log(
          `User already authenticated, redirecting to ${redirectPath}`
        );
        // Set auth status in local storage
        localStorage.setItem("auth_status", "authenticated");
        // Use the utility to break potential redirect loops
        localStorage.setItem("skip_initial_redirect", "true");
        navigate(redirectPath, { replace: true });
      }
      setInitialCheckDone(true);
    };

    checkAuth();
  }, [navigate, redirectPath]);

  // Check for error param in URL (from Google auth callback)
  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam && initialCheckDone) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description:
          errorParam || "Failed to complete authentication. Please try again.",
      });
    }
  }, [errorParam, toast, initialCheckDone]);

  // Hide the login form until initial check is complete to prevent flashing
  if (!initialCheckDone) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Sign in to SkyGuide"
      subtitle="Enter your credentials to continue."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
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
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
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
                    className="text-xs text-brand-gold hover:text-brand-gold/80 underline underline-offset-4"
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
            className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex items-center gap-3 text-gray-400 text-sm my-2">
            <hr className="flex-grow border-t border-white/10" />
            <span className="text-xs">OR</span>
            <hr className="flex-grow border-t border-white/10" />
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-gold hover:underline hover:text-brand-gold/80"
            >
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;
