import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const signupFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;
export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);

    try {
      // Set a flag to prevent SessionCheck from redirecting during signup
      localStorage.setItem("login_in_progress", "true");

      // Sign up
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
        localStorage.removeItem("login_in_progress");
        setLoading(false);
        return;
      }

      if (authData.session) {
        // Add the user to the profiles table
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user?.id,
          email: data.email,
          subscription_plan: "free",
          account_status: "active",
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        // Clean up before navigation
        localStorage.removeItem("login_in_progress");

        // Pass email to login form for convenience
        navigate("/login", {
          replace: true,
          state: {
            from_signup: true,
            email: data.email,
          },
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
        localStorage.removeItem("login_in_progress");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      localStorage.removeItem("login_in_progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join SkyGuide"
      subtitle="Create your account and start exploring"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    className="bg-background/30 border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
                    {...field}
                  />
                </FormControl>
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
                <span>Creating account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </Button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <GoogleSignInButton />

          <div className="text-center mt-6">
            <div className="text-xs text-gray-400 mb-3">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-brand-gold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand-gold hover:underline">
                Privacy Policy
              </Link>
            </div>

            <span className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
