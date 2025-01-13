import { SelectField } from "../form-fields/SelectField";
import { InputField } from "../form-fields/InputField";
import { jobTitles, airlines } from "../constants/formOptions";
import { FormData } from "../types/accountTypes";

interface WorkInfoSectionProps {
  isEditing: boolean;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (value: string, field: string) => void;
  profile: any;
}

export const WorkInfoSection = ({
  isEditing,
  formData,
  handleInputChange,
  handleSelectChange,
  profile,
}: WorkInfoSectionProps) => {
  return (
    <>
      <SelectField
        label="Job Title"
        name="user_type"
        value={formData.user_type}
        options={jobTitles}
        onChange={handleSelectChange}
        required
        isEditing={isEditing}
        displayValue={profile?.user_type}
      />
      <SelectField
        label="Airline"
        name="airline"
        value={formData.airline}
        options={airlines}
        onChange={handleSelectChange}
        required
        isEditing={isEditing}
        displayValue={profile?.airline}
      />
      <InputField
        label="Employee ID"
        name="employee_id"
        value={formData.employee_id}
        onChange={handleInputChange}
        required
        isEditing={isEditing}
        displayValue={profile?.employee_id}
        placeholder="Required"
      />
    </>
  );
};