
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountFormFields } from "@/components/account/AccountFormFields";
import { useTheme } from "@/components/theme-provider";

interface AccountInfoCardProps {
  isEditing: boolean;
  formData: {
    full_name: string;
    user_type: string;
    airline: string;
    address: string;
    phone_number: string;
    employee_id: string;
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile: any;
  hasSetAirlineAndJobRole: boolean;
  onSave: () => void;
  onEdit: () => void;
}

export const AccountInfoCard = ({
  isEditing,
  formData,
  handleInputChange,
  profile,
  hasSetAirlineAndJobRole,
  onSave,
  onEdit
}: AccountInfoCardProps) => {
  const {theme} = useTheme();
  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-brand-navy">Account Information</CardTitle>
        <Button
          variant="outline"
          onClick={() => {
            if (isEditing) {
              onSave();
            } else {
              onEdit();
            }
          }}
          className={`hover:bg-secondary flex items-center transition-colors ${
            theme === "dark" 
              ? "text-slate-300 hover:text-white" 
              : "text-slate-700 hover:text-white bg-slate-300"
          }`}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </CardHeader>
      <CardContent>
        <AccountFormFields 
          isEditing={isEditing}
          formData={formData}
          handleInputChange={handleInputChange}
          profile={profile}
          hasSetAirlineAndJobRole={hasSetAirlineAndJobRole}
        />
      </CardContent>
    </Card>
  );
};
