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
import AuthDivider from "@/components/auth/AuthDivider";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";

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
          <AuthButton
            loading={loading}
            loadingText="Creating account"
            defaultText="Create Account"
          />
          <AuthDivider />
          <GoogleSignInButton />
          <AuthFooter
            isPrivacyPolicyEnable={true}
            bottomText="Already have an account?"
            bottomLinkText="Sign in"
            bottomLinkTo="/login"
          />
        </form>
      </Form>
    </AuthLayout>
  );
}
