import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TwoFactorAuthProps {
  profile: any;
  onUpdate: () => void;
}

export const TwoFactorAuth = ({ profile, onUpdate }: TwoFactorAuthProps) => {
  const { toast } = useToast();
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handle2FAToggle = async () => {
    try {
      if (!profile.two_factor_enabled) {
        setIsEnabling2FA(true);
        // In a real implementation, you would:
        // 1. Generate a secret key
        // 2. Generate a QR code
        // 3. Show the QR code to the user
        // 4. Verify the code they enter
        // For this demo, we'll simulate the process
        const mockBackupCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        );
        setBackupCodes(mockBackupCodes);
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            two_factor_enabled: false,
            two_factor_backup_codes: null
          })
          .eq('id', profile.id);

        if (error) throw error;

        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled for your account.",
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update 2FA settings. Please try again.",
      });
    }
  };

  const handleVerification = async () => {
    try {
      // In a real implementation, you would verify the code against the secret
      // For this demo, we'll accept any 6-digit code
      if (verificationCode.length === 6) {
        const { error } = await supabase
          .from('profiles')
          .update({
            two_factor_enabled: true,
            two_factor_backup_codes: backupCodes
          })
          .eq('id', profile.id);

        if (error) throw error;

        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled for your account.",
        });
        setIsEnabling2FA(false);
        setVerificationCode("");
        onUpdate();
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
      });
    }
  };

  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader>
        <CardTitle className="text-brand-navy flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEnabling2FA ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-brand-navy">
                {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </h4>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={profile.two_factor_enabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-brand-navy">
                Enter Verification Code
              </h4>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
              <div className="flex justify-center py-4">
                <InputOTP
                  value={verificationCode}
                  onChange={setVerificationCode}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-brand-navy flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Backup Codes
                </h4>
                <p className="text-sm text-gray-500">
                  Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-md">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleVerification}
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Verify and Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEnabling2FA(false);
                  setVerificationCode("");
                  setBackupCodes([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};