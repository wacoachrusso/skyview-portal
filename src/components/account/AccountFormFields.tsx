import { getAssistantId } from "./form-fields/AssistantIdHandler";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { WorkInfoSection } from "./form-sections/WorkInfoSection";
import { AccountFormFieldsProps } from "./types/accountTypes";

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
      const assistantId = getAssistantId({ 
        airline: currentAirline.toLowerCase(),
        role: currentUserType.toLowerCase()
      });

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
      <PersonalInfoSection
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        profile={profile}
      />
      <WorkInfoSection
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        profile={profile}
      />
    </div>
  );
};