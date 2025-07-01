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
import { createNewSession } from "@/services/session";

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
      console.log("SignUp: Starting signup process with data:", {
        email: data.email,
        fullName: data.fullName,
        jobTitle: data.jobTitle,
        airline: data.airline,
      });

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("SignUp: Auth signup error:", error);
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
        return;
      }

      if (!authData.user?.id) {
        console.error("SignUp: No user ID returned from auth signup");
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Failed to create user account. Please try again.",
        });
        return;
      }

      console.log("SignUp: User created successfully with ID:", authData.user.id);

      // Look up the correct assistant based on airline and role
      console.log("SignUp: Looking up assistant for:", {
        airline: data.airline.toLowerCase(),
        role: data.jobTitle.toLowerCase(),
      });

      const { data: assistant, error: assistantError } = await supabase
        .from("openai_assistants")
        .select("assistant_id")
        .eq("airline", data.airline.toLowerCase())
        .eq("work_group", data.jobTitle.toLowerCase())
        .eq("is_active", true)
        .single();

      if (assistantError) {
        console.error("SignUp: Error finding assistant:", assistantError);
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Could not find the appropriate assistant for your role. Please try again or contact support.",
        });
        return;
      }

      if (!assistant) {
        console.error("SignUp: No assistant found for combination:", {
          airline: data.airline,
          role: data.jobTitle,
        });
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "No assistant available for your airline and role combination. Please contact support.",
        });
        return;
      }

      console.log("SignUp: Found assistant:", assistant.assistant_id);

      // Insert profile with the correct assistant_id
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        user_type: data.jobTitle,
        airline: data.airline,
        assistant_id: assistant.assistant_id,
        subscription_plan: "free",
        account_status: "active",
        role_type: "Line Holder"
      });

      if (profileError) {
        console.error("SignUp: Error saving profile:", profileError);
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Failed to save your profile information. Please try again.",
        });
        return;
      }

      console.log("SignUp: Profile created successfully with assistant_id:", assistant.assistant_id);

      // Create session
      await createNewSession(authData.user.id);

      // Sign out the user after successful signup to force them to log in explicitly
      await supabase.auth.signOut();
      
      // Clean up before navigation
      localStorage.removeItem("login_in_progress");

      console.log("SignUp: Signup process completed successfully, redirecting to login");

      navigate("/login", {
        replace: true,
        state: {
          from_signup: true,
          email: data.email,
        },
      });
      
      toast({
        title: "Signup successful",
        description: "Check your email to verify your account before logging in.",
      });
    } catch (error) {
      console.error("SignUp: Unexpected error during signup:", error);
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
