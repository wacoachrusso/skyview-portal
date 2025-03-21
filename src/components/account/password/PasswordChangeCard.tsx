
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/password-reset/ChangePasswordForm";

interface PasswordChangeCardProps {
  isPasswordChangeRequired: boolean;
}

export const PasswordChangeCard = ({ isPasswordChangeRequired }: PasswordChangeCardProps) => {
  return (
    <Card className={`bg-white/95 shadow-xl ${isPasswordChangeRequired ? 'border-2 border-brand-navy' : ''}`}>
      <CardHeader>
        <CardTitle className="text-brand-navy">
          Change Your Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPasswordChangeRequired ? (
          <div className="text-gray-600 mb-4">
            Please change your temporary password to continue using your account.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-600">
              You can change your password at any time to keep your account secure.
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Need help? Contact us at{" "}
              <a 
                href="mailto:alpha@skyguide.site" 
                className="text-brand-navy hover:underline"
              >
                alpha@skyguide.site
              </a>
            </div>
          </div>
        )}
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
};
