
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createUserAccount, SignupData } from "@/utils/auth/userCreationHandler";

// Schema for the signup form
const formSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  full_name: z.string().min(2, { message: "Full name is required" }),
  job_title: z.string().min(1, { message: "Job title is required" }),
  airline: z.string().min(1, { message: "Airline is required" }),
  plan: z.string().default("free"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(true); // Default to true until confirmed
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if waitlist is enabled
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      setWaitlistLoading(true);
      try {
        // Add retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let waitlistData = null;
        
        while (attempts < maxAttempts && waitlistData === null) {
          console.log(`Signup page - Waitlist check attempt ${attempts + 1}`);
          try {
            const { data, error } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'show_waitlist')
              .single();
              
            if (data && !error) {
              waitlistData = data;
              break;
            } else {
              console.error(`Attempt ${attempts + 1} error:`, error);
            }
          } catch (fetchError) {
            console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        console.log("Signup page - Waitlist check final status:", waitlistData?.value);
        
        // If we failed to fetch data after all attempts, default to showing waitlist
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to show waitlist");
          setShowWaitlist(true);
        } else {
          // Explicitly convert to boolean
          const shouldShowWaitlist = !!waitlistData.value;
          console.log("Setting waitlist enabled to:", shouldShowWaitlist);
          setShowWaitlist(shouldShowWaitlist);
          
          if (shouldShowWaitlist) {
            // Fixed the error by using the local variable instead of directly referencing waitlistEnabled
            // Redirect to home where the waitlist will be shown
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking waitlist status:", error);
        // Default to showing waitlist on error
        setShowWaitlist(true);
        navigate('/', { replace: true });
      } finally {
        setWaitlistLoading(false);
      }
    };
    
    checkWaitlistStatus();
  }, [navigate]);

  // Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      job_title: "",
      airline: "",
      plan: "free"
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already authenticated, redirecting to chat");
        navigate('/chat', { replace: true });
      }
      setInitialCheckDone(true);
    };
    
    checkAuth();
  }, [navigate]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      console.log("Creating user account:", data);
      
      // Create the user account - ensure all required fields are present
      const user = await createUserAccount({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        job_title: data.job_title,
        airline: data.airline,
        plan: data.plan
      });
      
      if (user) {
        toast({
          title: "Account created",
          description: "Your account has been successfully created.",
        });
        
        // Flag for new signup to handle redirects
        localStorage.setItem('new_user_signup', 'true');
        
        // Navigate to login
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      
      let errorMessage = "An error occurred creating your account.";
      
      // Handle specific error messages
      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please log in instead.";
      }
      
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Go to login page
  const goToLogin = () => {
    navigate('/login');
  };

  // Hide the signup form until initial check is complete to prevent flashing
  if (waitlistLoading || !initialCheckDone) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If waitlist is enabled, this component should not render (redirected in useEffect)
  if (showWaitlist) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
            alt="SkyGuide Logo"
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create a SkyGuide Account
          </h1>
          <p className="text-sm text-gray-400">
            Enter your information to sign up
          </p>
        </div>

        <div className="rounded-xl bg-card-gradient border border-white/10 p-6 shadow-xl backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        type="email" 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700"
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
                    <FormLabel className="text-gray-200">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          {...field} 
                          className="bg-gray-800/50 border-gray-700 pr-10"
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Smith" 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="Flight Attendant">Flight Attendant</SelectItem>
                          <SelectItem value="Pilot">Pilot</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="airline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Airline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select airline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="United">United</SelectItem>
                          <SelectItem value="Alaska">Alaska</SelectItem>
                          <SelectItem value="Delta">Delta</SelectItem>
                          <SelectItem value="American">American</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : "Sign Up"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button 
                type="button" 
                onClick={goToLogin}
                className="text-brand-gold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
