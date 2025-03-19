
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePasswordReset = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = async (newPassword: string) => {
    setLoading(true);
    try {
      console.log("Attempting to update password");
      
      // Use the updateUser method to set the new password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      console.log("Password updated successfully");
      
      // Show success toast
      toast({
        title: "Password Reset Complete",
        description: "Your password has been successfully reset."
      });
      
      setResetSuccess(true);
      
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Unable to reset your password. Please try again or request a new reset link."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    resetSuccess,
    handleResetPassword
  };
};
