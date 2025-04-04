
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNewSession } from "@/services/session";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { AuthFormFooter } from "./AuthFormFooter";
import { GoogleSignInButton } from "./GoogleSignInButton";

const authFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSession } = useSessionHandler();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);

    try {
      if (isLogin) {
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
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          await createNewSession(authData.session.user.id);
          await handleSession();
        }
      } else {
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
          setLoading(false);
          return;
        }

        // Set signups to go to chat instead of asking for email verification
        if (authData.session) {
          toast({
            title: "Signup successful",
            description: "Welcome to SkyGuide!",
          });
          
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
          navigate("/chat");
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a verification link.",
          });
        }
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
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </Button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="px-3 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <GoogleSignInButton />
          </form>
        </Form>
        
        <AuthFormFooter isLogin={isLogin} />
      </CardContent>
    </Card>
  );
}
