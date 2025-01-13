import { Input } from "@/components/ui/input";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  isEditing: boolean;
  displayValue?: string;
  placeholder?: string;
}

export const InputField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  isEditing,
  displayValue,
  placeholder = "Optional",
}: InputFieldProps) => {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <span className="font-medium text-brand-navy">
        {label}{required && <span className="text-red-500 ml-1">*</span>}:
      </span>
      {isEditing ? (
        <Input
          name={name}
          value={value}
          onChange={onChange}
          className="col-span-2 border-gray-300"
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <span className="col-span-2 text-gray-700">
          {displayValue || (required ? 'Required' : 'Not set')}
        </span>
      )}
    </div>
  );
};