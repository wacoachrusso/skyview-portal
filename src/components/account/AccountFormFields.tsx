import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Assistant ID mapping
const UNITED_FA_ASSISTANT_ID = "asst_YdZtVHPSq6TIYKRkKcOqtwzn";
const AMERICAN_FA_ASSISTANT_ID = "asst_xpkEzhLUt4Qn6uzRzSxAekGh";

export const AccountFormFields = ({
  isEditing,
  formData,
  handleInputChange,
  profile,
}: AccountFormFieldsProps) => {
  const handleSelectChange = (value: string, field: string) => {
    // Create a synthetic event to match the existing handleInputChange
    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);

    // Handle assistant ID updates based on airline and job title combinations
    if (field === 'airline') {
      if (value.toLowerCase() === 'united airlines' && 
          formData.user_type.toLowerCase() === 'flight attendant') {
        const assistantEvent = {
          target: {
            name: 'assistant_id',
            value: UNITED_FA_ASSISTANT_ID
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(assistantEvent);
      } else if (value.toLowerCase() === 'american airlines' && 
                formData.user_type.toLowerCase() === 'flight attendant') {
        const assistantEvent = {
          target: {
            name: 'assistant_id',
            value: AMERICAN_FA_ASSISTANT_ID
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(assistantEvent);
      }
    } else if (field === 'user_type' && value.toLowerCase() === 'flight attendant') {
      if (formData.airline.toLowerCase() === 'united airlines') {
        const assistantEvent = {
          target: {
            name: 'assistant_id',
            value: UNITED_FA_ASSISTANT_ID
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(assistantEvent);
      } else if (formData.airline.toLowerCase() === 'american airlines') {
        const assistantEvent = {
          target: {
            name: 'assistant_id',
            value: AMERICAN_FA_ASSISTANT_ID
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(assistantEvent);
      }
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Full Name<span className="text-red-500 ml-1">*</span>:
        </span>
        {isEditing ? (
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="col-span-2 border-gray-300"
            placeholder="Required"
            required
          />
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.full_name || 'Required'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Job Title<span className="text-red-500 ml-1">*</span>:
        </span>
        {isEditing ? (
          <Select
            value={formData.user_type.toLowerCase()}
            onValueChange={(value) => handleSelectChange(value, 'user_type')}
          >
            <SelectTrigger className="col-span-2 bg-white border-gray-300">
              <SelectValue placeholder="Select Job Title" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
              {jobTitles.map((title) => (
                <SelectItem 
                  key={title} 
                  value={title.toLowerCase()}
                  className="hover:bg-gray-100 text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.user_type || 'Required'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Airline<span className="text-red-500 ml-1">*</span>:
        </span>
        {isEditing ? (
          <Select
            value={formData.airline.toLowerCase()}
            onValueChange={(value) => handleSelectChange(value, 'airline')}
          >
            <SelectTrigger className="col-span-2 bg-white border-gray-300">
              <SelectValue placeholder="Select Airline" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
              {airlines.map((airline) => (
                <SelectItem 
                  key={airline} 
                  value={airline.toLowerCase()}
                  className="hover:bg-gray-100 text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {airline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.airline || 'Required'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Employee ID<span className="text-red-500 ml-1">*</span>:
        </span>
        {isEditing ? (
          <Input
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className="col-span-2 border-gray-300"
            placeholder="Required"
            required
          />
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.employee_id || 'Required'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Address:
        </span>
        {isEditing ? (
          <Input
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="col-span-2"
            placeholder="Optional"
          />
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.address || 'Not set'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <span className="font-medium text-brand-navy">
          Phone Number:
        </span>
        {isEditing ? (
          <Input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="col-span-2"
            placeholder="Optional"
          />
        ) : (
          <span className="col-span-2 text-gray-700">
            {profile?.phone_number || 'Not set'}
          </span>
        )}
      </div>
    </div>
  );
};