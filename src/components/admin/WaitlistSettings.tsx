
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export function WaitlistSettings() {
  const { toast } = useToast();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [signupCount, setSignupCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current settings and signup count
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Get waitlist settings
      const { data: showWaitlistData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'show_waitlist')
        .single();

      const { data: forceOpenData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'waitlist_force_open')
        .single();

      // Get signup count
      const { count } = await supabase
        .from('waitlist_signups')
        .select('*', { count: 'exact', head: true });

      setShowWaitlist(showWaitlistData?.value === true);
      setForceOpen(forceOpenData?.value === true);
      setSignupCount(count || 0);
    } catch (error) {
      console.error("Error loading waitlist settings:", error);
      toast({
        title: "Error",
        description: "Failed to load waitlist settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update waitlist settings
  const updateSetting = async (key: string, value: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Waitlist settings updated successfully.",
      });

      // Update local state
      if (key === 'show_waitlist') setShowWaitlist(value);
      if (key === 'waitlist_force_open') setForceOpen(value);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${key.replace('_', ' ')}.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Pre-Launch Waitlist Settings</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Configure the pre-launch waitlist page and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <Label htmlFor="show-waitlist" className="text-base font-medium">
                Enable Pre-Launch Waitlist Page
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, visitors will see the waitlist page instead of the main landing page
              </p>
            </div>
            <Switch
              id="show-waitlist"
              checked={showWaitlist}
              onCheckedChange={(checked) => updateSetting('show_waitlist', checked)}
              disabled={isUpdating || isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <Label htmlFor="force-open" className="text-base font-medium">
                Manually Reopen Waitlist (Override Auto-Close)
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the waitlist form will remain open even if the 300 signup limit is reached
              </p>
            </div>
            <Switch
              id="force-open"
              checked={forceOpen}
              onCheckedChange={(checked) => updateSetting('waitlist_force_open', checked)}
              disabled={isUpdating || isLoading || !showWaitlist}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Current Status</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Signups:</span>
              <span className="font-medium">{isLoading ? '...' : signupCount}/300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waitlist Status:</span>
              <span className="font-medium">
                {isLoading ? '...' : (
                  showWaitlist
                    ? (signupCount >= 300 && !forceOpen
                      ? "Full (Closed)"
                      : "Open")
                    : "Disabled"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home Page Shows:</span>
              <span className="font-medium">
                {isLoading ? '...' : (
                  showWaitlist
                    ? "Waitlist Page"
                    : "Main Landing Page"
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
