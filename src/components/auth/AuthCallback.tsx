import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sendWelcomeEmail } from "@/utils/email";
import { supabase } from "@/integrations/supabase/client";

export function AuthCallback() {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
        navigate("/login");
        return;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // New user, send welcome email
        await sendWelcomeEmail(user.email);
        navigate("/complete-profile");
      } else {
        // Existing user
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        navigate("/dashboard");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return null;
}