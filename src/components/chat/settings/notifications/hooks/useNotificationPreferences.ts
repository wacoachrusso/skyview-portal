import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_notifications, push_notifications')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          console.log("Loaded notification preferences:", profile);
          setPreferences({
            emailNotifications: profile.email_notifications ?? true,
            pushNotifications: profile.push_notifications ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const savePreferences = async (emailEnabled: boolean, pushEnabled: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: emailEnabled,
          push_notifications: pushEnabled
        })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences({
        emailNotifications: emailEnabled,
        pushNotifications: pushEnabled
      });

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    savePreferences
  };
}