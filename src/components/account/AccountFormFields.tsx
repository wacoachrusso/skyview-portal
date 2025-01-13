import { Input } from "@/components/ui/input";

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

export const AccountFormFields = ({
  isEditing,
  formData,
  handleInputChange,
  profile,
}: AccountFormFieldsProps) => {
  const fields = [
    { name: "full_name", label: "Full Name", required: true },
    { name: "user_type", label: "User Type", required: true },
    { name: "airline", label: "Airline", required: true },
    { name: "address", label: "Address", optional: true },
    { name: "phone_number", label: "Phone Number", optional: true },
    { name: "employee_id", label: "Employee ID", optional: true },
  ];

  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field.name} className="grid grid-cols-3 items-center gap-4">
          <span className="font-medium text-brand-navy">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}:
          </span>
          {isEditing ? (
            <Input
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleInputChange}
              className={`col-span-2 ${field.required ? 'border-gray-300' : ''}`}
              placeholder={field.optional ? "Optional" : "Required"}
              required={field.required}
            />
          ) : (
            <span className="col-span-2 text-gray-700">
              {profile?.[field.name] || (field.required ? 'Required' : 'Not set')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};