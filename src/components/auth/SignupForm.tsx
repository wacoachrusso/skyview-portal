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

const signupFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSession } = useSessionHandler();

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
      localStorage.setItem('login_in_progress', 'true');
      
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
        localStorage.removeItem('login_in_progress');
        setLoading(false);
        return;
      }

      if (authData.session) {
        // Add the user to the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user?.id,
            email: data.email,
            subscription_plan: 'free',
            account_status: 'active',
          });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        await createNewSession(authData.session.user.id);
        
        // Sign out the user after successful signup to force them to log in explicitly
        await supabase.auth.signOut();
        
        // Clean up before navigation
        localStorage.removeItem('login_in_progress');
        
        // Pass email to login form for convenience
        navigate("/login", { 
          replace: true,
          state: { 
            from_signup: true,
            email: data.email 
          }
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
        localStorage.removeItem('login_in_progress');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      localStorage.removeItem('login_in_progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card-gradient border border-white/10 shadow-xl backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">
            Create a New Account
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details below to get started
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
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      className="bg-background/30 border-white/10"
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
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-gold hover:text-brand-gold/80 transition-colors">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}