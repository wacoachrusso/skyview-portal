import { SelectField } from "./form-fields/SelectField";
import { InputField } from "./form-fields/InputField";
import { getAssistantId } from "./form-fields/AssistantIdHandler";

interface AccountFormFieldsProps {
  isEditing: boolean;
  formData: {
    full_name: string;
    user_type: string;
    airline: string;
    address: string;
    phone_number: string;
    employee_id: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile: any;
}

const jobTitles = [
  "Flight Attendant",
  "Pilot"
];

const airlines = [
  "United Airlines",
  "American Airlines",
  "Delta Air Lines",
  "Southwest Airlines",
  "Other"
];

export const AccountFormFields = ({
  isEditing,
  formData,
  handleInputChange,
  profile,
}: AccountFormFieldsProps) => {
  const handleSelectChange = (value: string, field: string) => {
    console.log('Select change:', { field, value });
    
    // Create a synthetic event to match the existing handleInputChange
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);

    // Handle assistant ID updates based on airline and job title combinations
    if (field === 'airline' || field === 'user_type') {
      const currentAirline = field === 'airline' ? value : formData.airline;
      const currentUserType = field === 'user_type' ? value : formData.user_type;

      console.log('Updating assistant ID for:', { currentAirline, currentUserType });
      const assistantId = getAssistantId(currentAirline, currentUserType);

      if (assistantId) {
        console.log('Setting new assistant ID:', assistantId);
        const assistantEvent = {
          target: {
            name: 'assistant_id',
            value: assistantId
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(assistantEvent);
      }
    }
  };

  return (
    <div className="grid gap-4">
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
    </div>
  );
};