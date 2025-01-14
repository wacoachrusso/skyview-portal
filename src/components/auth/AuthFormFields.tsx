import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./form-fields/PasswordField";
import { JobTitleField } from "./form-fields/JobTitleField";
import { AirlineField } from "./form-fields/AirlineField";

export interface AuthFormFieldsProps {
  formData: {
    email: string;
    password: string;
    fullName: string;
    jobTitle: string;
    airline: string;
  };
  setFormData: (data: any) => void;
  showPassword: boolean;  // Added this prop to the interface
  setShowPassword: (show: boolean) => void;  // Added this prop to the interface
}

export const AuthFormFields = ({ 
  formData, 
  setFormData, 
  showPassword, 
  setShowPassword 
}: AuthFormFieldsProps) => {
  const handleInputChange = (field: string, value: string) => {
    if (field === 'jobTitle' && value === 'pilot' && formData.airline.toLowerCase() === 'american airlines') {
      setFormData({ ...formData, [field]: value, airline: '' });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-gray-200">Full Name <span className="text-red-500">*</span></Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
          required
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-200">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="bg-white/10 border-white/20 text-white"
          required
        />
      </div>

      <PasswordField 
        password={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />

      <JobTitleField
        value={formData.jobTitle}
        onChange={(value) => handleInputChange('jobTitle', value)}
        airline={formData.airline}
      />

      <AirlineField
        value={formData.airline}
        onChange={(value) => handleInputChange('airline', value)}
        jobTitle={formData.jobTitle}
      />
    </div>
  );
};