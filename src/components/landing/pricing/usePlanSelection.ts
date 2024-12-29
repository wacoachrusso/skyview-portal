import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePlanSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: string) => {
    console.log("Plan selection initiated:", plan);
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found, redirecting to signup with plan:", plan);
        navigate('/signup', { state: { selectedPlan: plan } });
        return;
      }

      // Get current user profile to check current plan
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Failed to fetch user profile");
      }

      if (!currentProfile) {
        throw new Error("User profile not found");
      }

      console.log("Current profile:", currentProfile);
      console.log("Changing from plan:", currentProfile.subscription_plan, "to:", plan);

      // Prevent downgrade to free plan
      if (plan === 'free' && currentProfile.subscription_plan !== 'free') {
        toast({
          variant: "destructive",
          title: "Action not allowed",
          description: "You cannot downgrade to a free plan after using a paid subscription.",
        });
        setIsLoading(false);
        return;
      }

      // Get user's IP address using a public API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const updates = {
        subscription_plan: plan,
        last_ip_address: ip,
        query_count: 0,
        last_query_timestamp: new Date().toISOString()
      };

      console.log("Updating user profile with:", updates);
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      // Send email notification about plan change
      console.log("Sending plan change email notification");
      const { error: emailError, data: emailResponse } = await supabase.functions.invoke('send-plan-change-email', {
        body: {
          email: currentProfile.email,
          oldPlan: currentProfile.subscription_plan,
          newPlan: plan,
          fullName: currentProfile.full_name
        },
      });

      if (emailError) {
        console.error("Error sending plan change email:", emailError);
        // Don't throw here, just log the error since the plan change was successful
      } else {
        console.log("Plan change email sent successfully:", emailResponse);
      }

      toast({
        title: "Plan Updated",
        description: `Your subscription has been changed to the ${plan} plan.`,
      });

      navigate('/chat');
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePlanSelection,
    isLoading
  };
};