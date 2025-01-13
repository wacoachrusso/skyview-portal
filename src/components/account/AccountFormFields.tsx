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
      
      try {
        // Only attempt to get assistant ID if both values are present
        if (currentAirline && currentUserType) {
          const assistantId = getAssistantId({ 
            airline: currentAirline.toLowerCase(),
            role: currentUserType.toLowerCase() === "flight attendant" ? "flight attendant" : undefined
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
      } catch (error) {
        console.error('Error getting assistant ID:', error);
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