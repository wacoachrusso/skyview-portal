
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UseAccountActionsReturn } from "./types";

export const useAccountActions = (userId: string | undefined): UseAccountActionsReturn => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCancelSubscription = async () => {
    try {
      if (!userId) {
        console.error("No authenticated user found");
        return;
      }
      
      console.log("Cancelling subscription for user:", userId);
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          subscription_status: 'inactive',
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
      
      // Send email notification about subscription cancellation
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single();
          
        if (profileData) {
          await supabase.functions.invoke('send-plan-change-email', {
            body: {
              email: profileData.email,
              oldPlan: 'paid',
              newPlan: 'free',
              fullName: profileData.full_name || 'User'
            }
          });
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Non-critical error, continue with the cancellation process
      }
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      // Refresh profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      if (!userId) {
        console.error("No authenticated user found");
        return;
      }
      
      console.log("Marking account as deleted for user:", userId);
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'deleted',
          subscription_plan: 'free',
          subscription_status: 'inactive'
        })
        .eq('id', userId);
        
      if (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account. Please try again.",
      });
    }
  };

  return {
    handleCancelSubscription,
    handleDeleteAccount
  };
};
