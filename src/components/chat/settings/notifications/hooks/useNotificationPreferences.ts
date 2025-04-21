import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  pushNotifications: boolean;
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('push_notifications')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error loading profile:", error);
          return;
        }
          
        if (profile) {
          console.log("Loaded notification preferences:", profile);
          setPreferences({
            pushNotifications: profile.push_notifications ?? false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (pushEnabled: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          push_notifications: pushEnabled
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setPreferences({
        pushNotifications: pushEnabled
      });

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
      return false;
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