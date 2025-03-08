
// File: src/components/auth/LoginForm.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { checkExistingProfile, updateLoginAttempts, resetLoginAttempts } from "@/services/loginService";

// Define form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onNewLogin?: () => Promise<void>;
}

export const LoginForm = ({ onNewLogin }: LoginFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", data.email);
      
      // Validate email and check login attempts
      const profile = await checkExistingProfile(data.email);
      console.log("Profile check result:", profile);
      
      // Check if account is locked or suspended
      if (profile && (profile.account_status === 'locked' || profile.account_status === 'suspended')) {
        const statusMessage = profile.account_status === 'locked' 
          ? "Your account has been locked due to too many failed login attempts. Please reset your password to unlock it."
          : "Your account has been suspended. Please contact support for assistance.";
          
        toast({
          variant: "destructive",
          title: "Account " + profile.account_status,
          description: statusMessage,
        });
        setIsLoading(false);
        return;
      }
      
      // Attempt login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Handle failed login by incrementing attempts
        console.error("Login error:", error);
        
        if (profile) {
          const attempts = (profile.login_attempts || 0) + 1;
          const newStatus = attempts >= 5 ? 'locked' : 'active';
          await updateLoginAttempts(data.email, attempts, newStatus);
          
          // Show specific message if account will be locked
          if (attempts === 5) {
            toast({
              variant: "destructive",
              title: "Account Locked",
              description: "Too many failed login attempts. Your account has been locked for security."
            });
            setIsLoading(false);
            return;
          }
        }
        
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Reset login attempts on successful login
      if (profile) {
        await resetLoginAttempts(data.email);
      }
      
      // Get user profile to check admin status
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin, user_type, airline')
        .eq('id', authData.user.id)
        .single();
        
      console.log("User profile after login:", userProfile);
      
      // Show success message
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Redirect based on user role or profile completion
      if (userProfile?.is_admin) {
        console.log("Admin user detected, redirecting to admin dashboard");
        navigate("/admin");
      } else if (userProfile?.user_type && userProfile?.airline) {
        navigate("/dashboard");
      } else {
        navigate("/account");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-[#2A3441] border-[#3E4A5E] text-white"
                    placeholder="you@example.com"
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-white">Password</FormLabel>
                  <Button
                    variant="link"
                    className="p-0 text-xs text-blue-400"
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <Input
                    className="bg-[#2A3441] border-[#3E4A5E] text-white"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1A1F2C] px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton />

      <div className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Button
          variant="link"
          className="p-0 text-blue-400"
          type="button"
          onClick={() => navigate('/signup')}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};
