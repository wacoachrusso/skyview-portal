import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordForm } from "@/components/auth/password-reset/ChangePasswordForm";
import { EmailDisplay } from "./EmailDisplay";
import { ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [hasSetAirlineAndJobRole, setHasSetAirlineAndJobRole] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    user_type: profile?.user_type || '',
    airline: profile?.airline || '',
    address: profile?.address || '',
    phone_number: profile?.phone_number || '',
    employee_id: profile?.employee_id || '',
    assistant_id: profile?.assistant_id || '',
  });

  // Mock data for airlines and job roles (replace with your actual data)
  const airlines = ["Delta Airlines", "American Airlines", "United Airlines", "Southwest Airlines", "Alaska Airlines"];
  const jobRoles = ["Pilot", "Flight Attendant"];

  // Disable Delta Airlines if the job role is "Flight Attendant"
  const isAirlineDisabled = (airline: string) => {
    return formData.user_type === "Flight Attendant" && airline === "Delta Airlines";
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!profile?.id) return;

      console.log('Checking alpha tester and promoter status for profile:', profile.id);

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

      if (alphaTester?.temporary_password || alphaTester?.is_promoter) {
        console.log('Setting password change as required');
        setIsPasswordChangeRequired(true);
        setIsEditing(true);
      }
    };

    checkUserStatus();
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.airline && profile?.user_type) {
      setHasSetAirlineAndJobRole(true);
    }
  }, [profile]);

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset airline if the job role changes to "Flight Attendant" and Delta Airlines is selected
    if (name === "user_type" && value === "Flight Attendant" && formData.airline === "Delta Airlines") {
      setFormData(prev => ({
        ...prev,
        airline: ""
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Form data:', formData);

    if (!isProfileComplete()) {
      console.log('Profile is not complete');
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill out your full name, job title, airline, and employee ID.",
      });
      return;
    }

    try {
      const { data: assistant, error: assistantError } = await supabase
        .from('openai_assistants')
        .select('assistant_id')
        .eq('airline', formData.airline.toLowerCase())
        .eq('work_group', formData.user_type.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      console.log('Assistant lookup result:', { assistant, error: assistantError });

      if (assistantError) {
        console.error('Assistant lookup error:', assistantError);
        throw new Error('Error looking up assistant configuration. Please try again.');
      }

      if (!assistant) {
        console.log('No matching assistant found for:', {
          airline: formData.airline,
          jobTitle: formData.user_type,
        });
        throw new Error('We currently do not support your airline and role combination. Please contact support for assistance.');
      }

      console.log('Found matching assistant:', assistant);

      const updatedFormData = {
        ...formData,
        assistant_id: assistant.assistant_id,
      };

      console.log('Attempting to update profile with data:', updatedFormData);
      const { error } = await supabase
        .from('profiles')
        .update(updatedFormData)
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully');
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setHasSetAirlineAndJobRole(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy sm:text-sm"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Role</label>
              <Select
                value={formData.user_type}
                onValueChange={(value) => handleSelectChange('user_type', value)}
                disabled={!isEditing || hasSetAirlineAndJobRole}
              >
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {jobRoles.map((role) => (
                    <SelectItem key={role} value={role} className="hover:bg-gray-700">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Airline</label>
              <Select
                value={formData.airline}
                onValueChange={(value) => handleSelectChange('airline', value)}
                disabled={!isEditing || hasSetAirlineAndJobRole}
              >
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue placeholder="Select airline" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {airlines.map((airline) => (
                    <SelectItem
                      key={airline}
                      value={airline}
                      className="hover:bg-gray-700"
                      disabled={isAirlineDisabled(airline)}
                    >
                      {airline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy sm:text-sm"
                disabled={!isEditing}
              />
            </div>
          </div>
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
    </div>
  );
};