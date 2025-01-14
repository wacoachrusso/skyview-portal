import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordForm } from "@/components/auth/password-reset/ChangePasswordForm";
import { AccountFormFields } from "./AccountFormFields";
import { EmailDisplay } from "./EmailDisplay";

interface AccountInfoProps {
  userEmail: string | null;
  profile: any;
  showPasswordChange?: boolean;
}

export const AccountInfo = ({ userEmail, profile, showPasswordChange = true }: AccountInfoProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    user_type: profile?.user_type || '',
    airline: profile?.airline || '',
    address: profile?.address || '',
    phone_number: profile?.phone_number || '',
    employee_id: profile?.employee_id || '',
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!profile?.id) return;

      console.log('Checking alpha tester and promoter status for profile:', profile.id);
      
      try {
        // Use maybeSingle() instead of single() to handle cases where no rows are found
        const { data: alphaTester, error } = await supabase
          .from('alpha_testers')
          .select('temporary_password, is_promoter')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking user status:', error);
          return;
        }

        console.log('User status data:', alphaTester);
        
        // Show password change form if they have a temporary password or are a promoter
        if (alphaTester?.temporary_password || alphaTester?.is_promoter) {
          console.log('Setting password change as required');
          setIsPasswordChangeRequired(true);
          setIsEditing(true); // Automatically enable profile editing
        }
      } catch (error) {
        console.error('Error in checkUserStatus:', error);
      }
    };

    checkUserStatus();
  }, [profile?.id]);

  // Check if required fields are filled
  const isProfileComplete = () => {
    return formData.full_name && 
           formData.user_type && 
           formData.airline && 
           formData.employee_id;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!isProfileComplete()) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill out your full name, job title, airline, and employee ID.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-brand-navy">Account Information</CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                handleSubmit();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmailDisplay userEmail={userEmail} />
          <AccountFormFields
            isEditing={isEditing}
            formData={formData}
            handleInputChange={handleInputChange}
            profile={profile}
          />
        </CardContent>
      </Card>

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
            <div className="text-gray-600 mb-4">
              You can change your password at any time to keep your account secure.
            </div>
          )}
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};