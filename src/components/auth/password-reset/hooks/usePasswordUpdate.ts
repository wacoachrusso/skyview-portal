import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from "../utils/passwordValidation";

export const usePasswordUpdate = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updatePassword = async (newPassword: string, confirmPassword: string) => {
    if (loading) return;
    setLoading(true);

    try {
      console.log('Starting password update process');
      
      // Validate new password
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        const unmetRequirements = validation.requirements
          .filter(req => !req.met)
          .map(req => req.text)
          .join(", ");
        
        toast({
          variant: "destructive",
          title: "Invalid Password",
          description: `Password requirements not met: ${unmetRequirements}`
        });
        return false;
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Passwords Don't Match",
          description: "Please make sure both passwords are identical"
        });
        return false;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(userError?.message || "No authenticated user found");
      }

      console.log('Updating password for user:', user.id);

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      console.log('Password updated successfully');

      // Get user profile for the name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Send confirmation email
      console.log('Sending password change confirmation email');
      const { error: emailError } = await supabase.functions.invoke('send-password-change-confirmation', {
        body: { 
          email: user.email,
          name: profile?.full_name
        }
      });

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully."
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password. Please try again."
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updatePassword, loading };
};