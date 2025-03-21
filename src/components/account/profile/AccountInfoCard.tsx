
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountFormFields } from "@/components/account/AccountFormFields";

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
