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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "@/styles/auth-autofill.css";
import { AuthInputField } from "@/components/auth/AuthInputField";
import { JobAndAirlineSelector } from "@/components/auth/JobAndAirlineSelector";

const signupFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .refine(
      (val) =>
        /[a-z]/.test(val) &&
        /[A-Z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(val),
      {
        message:
          "Password must include uppercase, lowercase, number, and special character.",
      }
    ),
  jobTitle: z.string().min(1, "Please select a job title."),
  airline: z.string().min(1, "Please select an airline."),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      jobTitle: "",
      airline: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
        return;
      }

      // Insert profile even if session is not available yet
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user?.id,
        email: data.email,
        full_name: data.fullName,
        job_title: data.jobTitle,
        airline: data.airline,
        subscription_plan: "free",
        account_status: "pending_verification", // optional
      });

      if (profileError) {
        console.error("Error saving profile:", profileError);
      }

      toast({
        title: "Signup successful",
        description:
          "Check your email to verify your account before logging in.",
      });

      navigate("/login");
    } catch (error) {
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
    <AuthLayout
      title="Join SkyGuide"
      subtitle="Create your account and start exploring"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthInputField
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            form={form}
          />
          <AuthInputField
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            form={form}
          />
          <AuthInputField
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            form={form}
          />
          <JobAndAirlineSelector form={form} />

          <Button
            type="submit"
            className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 transition-all duration-200 h-10 mt-2"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <GoogleSignInButton />

          <div className="text-center mt-4 text-xs text-gray-400">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-brand-gold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-brand-gold hover:underline">
              Privacy Policy
            </Link>
            <div className="mt-1 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-gold underline underline-offset-4 hover:text-brand-gold/80"
              >
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
