import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
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
          setEmailNotifications(profile.email_notifications ?? true);
          setPushNotifications(profile.push_notifications ?? true);
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

  const handleEmailToggle = async (checked: boolean) => {
    setEmailNotifications(checked);
    await savePreferences(checked, pushNotifications);
  };

  const handlePushToggle = async (checked: boolean) => {
    setPushNotifications(checked);
    await savePreferences(emailNotifications, checked);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-foreground">Email Notifications</label>
            <p className="text-sm text-muted-foreground">Receive updates and notifications via email</p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={handleEmailToggle}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-foreground">Push Notifications</label>
            <p className="text-sm text-muted-foreground">Get browser notifications for important updates</p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={handlePushToggle}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}