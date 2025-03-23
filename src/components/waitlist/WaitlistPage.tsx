
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Schema for the waitlist form
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, { message: "Role is required" }),
  airline: z.string().min(1, { message: "Airline is required" }),
  base: z.string().min(1, { message: "Base is required" }),
  preferredContact: z.string().min(1, { message: "Preferred contact method is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export function WaitlistPage({ forceOpen = false }: { forceOpen?: boolean }) {
  const [signupCount, setSignupCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      role: "",
      airline: "",
      base: "",
      preferredContact: "",
    },
  });

  // Fetch the current number of signups
  useEffect(() => {
    const fetchSignups = async () => {
      try {
        const { count, error } = await supabase
          .from("waitlist_signups")
          .select("*", { count: "exact", head: true });
        
        if (error) throw error;
        setSignupCount(count || 0);
      } catch (error) {
        console.error("Error fetching signup count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignups();
  }, []);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Insert the signup data
      const { error: insertError } = await supabase.from("waitlist_signups").insert({
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        role: data.role,
        airline: data.airline,
        base: data.base,
        preferred_contact: data.preferredContact,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique constraint violation (email already exists)
          toast({
            title: "Email already registered",
            description: "This email is already on our waitlist.",
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      // Send confirmation email via edge function
      const { error: emailError } = await supabase.functions.invoke("send-waitlist-confirmation", {
        body: { 
          name: data.fullName,
          email: data.email,
          role: data.role,
          airline: data.airline,
          phoneNumber: data.phoneNumber,
        },
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      // Show success message
      setIsSuccess(true);
      setSignupCount(prev => prev + 1);

    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get URL for admin login
  const adminLoginUrl = "/login";

  // Check if waitlist is full and not forced open
  const isWaitlistFull = signupCount >= 300 && !forceOpen;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-dark py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header with logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/60 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-800 shadow-xl"
        >
          {isSuccess ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">Thank You!</h2>
              <p className="text-gray-300 mb-6">
                Your request for early access has been received. We'll be in touch soon with information about getting started with SkyGuide.
              </p>
              <p className="text-brand-gold font-medium">
                {signupCount}/300 spots filled
              </p>
            </div>
          ) : isWaitlistFull ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Waitlist Full</h2>
              <p className="text-gray-300 mb-6">
                We've reached our early access limit — but you can still follow us for updates as we prepare to launch June 1st!
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy">
                  Follow Us on Twitter
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Flight Attendants & Pilots — Want Early Access to SkyGuide?
                </h1>
                <p className="text-xl text-brand-gold font-medium">
                  We're looking for 300 airline crew members to test our app before launch — totally free.
                </p>
              </div>

              <div className="mb-8 text-gray-300 space-y-4">
                <p>
                  SkyGuide is a powerful tool that helps airline crew members get contract answers fast.
                </p>
                <p>
                  Ask questions in everyday language — like "How much rest do I get between trips?" or "When am I supposed to get a crew meal?"
                </p>
                <p>
                  SkyGuide will give you the correct answer and the exact reference from your union contract — in seconds.
                </p>
                <div>
                  <p className="mb-2">We're inviting:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>United Airlines flight attendants and pilots (all bases)</li>
                    <li>American Airlines flight attendants and pilots (all bases)</li>
                    <li>Alaska Airlines flight attendants (all bases)</li>
                    <li>Delta Airlines pilots (all bases)</li>
                  </ul>
                </div>
                <p>
                  We are only accepting 300 testers. Once that number is reached, the waitlist will automatically close.
                </p>
                <p>
                  SkyGuide's public launch is scheduled for June 1st, 2025.
                </p>
                
                <div className="bg-brand-navy/50 p-4 rounded-lg border border-brand-teal/20 mt-6">
                  <p className="text-brand-gold font-medium">
                    {signupCount}/300 spots filled
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
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
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Email Address</FormLabel>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(555) 123-4567" 
                              type="tel" 
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
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Role</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                              <SelectContent 
                                className="bg-gray-800 border-gray-700 text-white"
                                position="popper"
                                sideOffset={5}
                              >
                                <SelectItem value="Flight Attendant">Flight Attendant</SelectItem>
                                <SelectItem value="Pilot">Pilot</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="airline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Airline</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select your airline" />
                              </SelectTrigger>
                              <SelectContent 
                                className="bg-gray-800 border-gray-700 text-white"
                                position="popper"
                                sideOffset={5}
                              >
                                <SelectItem value="United">United</SelectItem>
                                <SelectItem value="Alaska">Alaska</SelectItem>
                                <SelectItem value="Delta">Delta</SelectItem>
                                <SelectItem value="American">American</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="base"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Base or City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="LAX, DEN, etc." 
                              {...field} 
                              className="bg-gray-800/50 border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Preferred Contact Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select preferred contact method" />
                          </SelectTrigger>
                          <SelectContent 
                            className="bg-gray-800 border-gray-700 text-white"
                            position="popper"
                            sideOffset={5}
                          >
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Both">Both Email and Phone</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy text-lg font-semibold py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Request Free Access"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a 
            href={adminLoginUrl} 
            className="text-gray-500 hover:text-gray-400 text-sm"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
