import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  pushNotifications: boolean;
}

const STORAGE_KEY = "notification-preferences";

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
      // First try to load from localStorage for immediate UI update
      const savedPrefs = localStorage.getItem(STORAGE_KEY);
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(parsedPrefs);
      }

      // Then load from database (source of truth)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('push_notifications')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          console.log("Loaded notification preferences:", profile);
          const dbPrefs = {
            pushNotifications: profile.push_notifications === true,
          };
          
          // Update state with database values
          setPreferences(dbPrefs);
          
          // Also update localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPrefs));
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (pushEnabled: boolean) => {
    console.log("Saving preferences:", { pushEnabled });
    setLoading(true);
    
    try {
      // Update local state first for immediate feedback
      const newPrefs = {
        pushNotifications: pushEnabled
      };
      
      setPreferences(newPrefs);
      
      // Save to localStorage for persistence across reloads
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      
      // Then save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
  
      const { error } = await supabase
        .from('profiles')
        .update({
          push_notifications: pushEnabled,
        })
        .eq('id', user.id);
  
      if (error) throw error;
  
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      
      // Revert local state if save failed
      await loadPreferences();
      
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