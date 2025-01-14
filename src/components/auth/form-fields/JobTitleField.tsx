import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  airline: string;
}

const jobTitles = [
  "Flight Attendant",
  "Pilot"
];

export const JobTitleField = ({ value, onChange, airline }: JobTitleFieldProps) => {
  const isOptionEnabled = (title: string) => {
    // Enable Flight Attendant for both United and American Airlines
    if (title.toLowerCase() === "flight attendant") {
      return true;
    }
    // Enable Pilot only for United Airlines
    return title.toLowerCase() === "pilot" && airline.toLowerCase() === "united airlines";
  };

  return (
    <div className="relative">
      <Label htmlFor="jobTitle" className="text-gray-200">Select Job Title</Label>
      <Select 
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger className="bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="Select Job Title" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-white/20 text-white z-50">
          {jobTitles.map((title) => (
            <SelectItem 
              key={title} 
              value={title.toLowerCase()}
              className={`hover:bg-white/10 ${!isOptionEnabled(title) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isOptionEnabled(title)}
            >
              {title} {!isOptionEnabled(title) && "(Coming Soon)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};