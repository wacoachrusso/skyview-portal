import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

export const handleAuthSession = async (
  userId: string,
  createNewSession: (userId: string) => Promise<any>,
  navigate: NavigateFunction
) => {
  console.log("Creating new session for user:", userId);
  const newSession = await createNewSession(userId);
  
  if (!newSession) {
    console.error("Failed to create new session");
    throw new Error("Failed to create session");
  }

  console.log("New session created successfully:", newSession);

  toast({
    title: "Welcome to SkyGuide!",
    description: "Your account has been created and you've been successfully signed in."
  });
  
  console.log("Redirecting to dashboard");
  navigate('/dashboard');
};