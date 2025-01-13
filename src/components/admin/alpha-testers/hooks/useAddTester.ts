import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { verifyAdminStatus } from "../utils/adminUtils";
import { checkExistingProfile, checkExistingTester, createAuthUser } from "../utils/userUtils";
import { createAlphaTester, sendWelcomeEmail } from "../utils/testerUtils";
import { generatePassword } from "../utils/passwordUtils";

interface AddTesterFormData {
  email: string;
  fullName: string;
  password: string;
  isPromoter: boolean;
}

export const useAddTester = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addTester = async (data: AddTesterFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Starting add tester process...");

      // First verify admin status
      await verifyAdminStatus();

      // Check if user already exists as tester
      await checkExistingTester(data.email);

      // Check if profile exists
      const existingProfile = await checkExistingProfile(data.email);
      
      // Create or get user ID
      const userId = existingProfile ? existingProfile.id : 
        (await createAuthUser(data.email, data.password, data.fullName)).id;
      
      // Create alpha tester record
      await createAlphaTester({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        userId,
        isPromoter: data.isPromoter
      });
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail({
        email: data.email,
        fullName: data.fullName,
        temporaryPassword: data.password,
        isPromoter: data.isPromoter
      });
      
      if (emailSent) {
        toast({
          title: "Success",
          description: `${data.isPromoter ? 'Promoter' : 'Alpha tester'} added and welcome email sent with login credentials`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Tester added but failed to send welcome email",
        });
      }

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error adding alpha tester:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add alpha tester",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addTester,
    isSubmitting,
    generatePassword
  };
};