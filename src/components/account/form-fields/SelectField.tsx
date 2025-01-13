import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string, field: string) => void;
  name: string;
  required?: boolean;
  isEditing: boolean;
  displayValue?: string;
}

export const SelectField = ({
  label,
  value,
  options,
  onChange,
  name,
  required = false,
  isEditing,
  displayValue,
}: SelectFieldProps) => {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <span className="font-medium text-brand-navy">
        {label}{required && <span className="text-red-500 ml-1">*</span>}:
      </span>
      {isEditing ? (
        <Select
          value={value.toLowerCase()}
          onValueChange={(value) => onChange(value, name)}
        >
          <SelectTrigger className="col-span-2 bg-gray-50 border-gray-300">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="bg-card border-gray-700 shadow-lg z-50">
            {options.map((option) => (
              <SelectItem 
                key={option} 
                value={option.toLowerCase()}
                className="hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="col-span-2 text-gray-700">
          {displayValue || 'Required'}
        </span>
      )}
    </div>
  );
};