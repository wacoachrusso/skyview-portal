import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkExistingUser = async (email: string, password: string) => {
  console.log("Checking if user already exists:", email);
  const { data: existingUser } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (existingUser?.user) {
    console.log("User already exists:", email);
    toast({
      title: "Error",
      description: "An account with this email already exists. Please sign in or use a different email.",
      variant: "destructive",
    });
    return true;
  }

  return false;
};

export const getUserIpAddress = async () => {
  console.log("Fetching user IP address");
  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const { ip } = await ipResponse.json();
  console.log("Got user IP:", ip);
  return ip;
};