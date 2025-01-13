import { InputField } from "../form-fields/InputField";
import { FormData } from "../types/accountTypes";

interface PersonalInfoSectionProps {
  isEditing: boolean;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile: any;
}

export const PersonalInfoSection = ({
  isEditing,
  formData,
  handleInputChange,
  profile,
}: PersonalInfoSectionProps) => {
  return (
    <>
      <InputField
        label="Full Name"
        name="full_name"
        value={formData.full_name}
        onChange={handleInputChange}
        required
        isEditing={isEditing}
        displayValue={profile?.full_name}
        placeholder="Required"
      />
      <InputField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        isEditing={isEditing}
        displayValue={profile?.address}
      />
      <InputField
        label="Phone Number"
        name="phone_number"
        value={formData.phone_number}
        onChange={handleInputChange}
        isEditing={isEditing}
        displayValue={profile?.phone_number}
      />
    </>
  );
};