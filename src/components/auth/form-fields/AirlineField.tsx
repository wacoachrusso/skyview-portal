import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AirlineFieldProps {
  value: string;
  onChange: (value: string) => void;
  jobTitle: string;
}

const airlines = [
  "United Airlines",
  "American Airlines",
  "Delta Air Lines",
  "Southwest Airlines",
  "Other"
];

export const AirlineField = ({ value, onChange, jobTitle }: AirlineFieldProps) => {
  const isOptionEnabled = (airline: string) => {
    // Allow American Airlines for Flight Attendants, United Airlines for all
    if (airline.toLowerCase() === "american airlines") {
      return jobTitle.toLowerCase() === "flight attendant";
    }
    return airline.toLowerCase() === "united airlines";
  };

  return (
    <div className="relative">
      <Label htmlFor="airline" className="text-gray-200">Select Airline</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="Select Airline" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-white/20 text-white z-50">
          {airlines.map((airline) => (
            <SelectItem 
              key={airline} 
              value={airline.toLowerCase()}
              className={`hover:bg-white/10 ${!isOptionEnabled(airline) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isOptionEnabled(airline)}
            >
              {airline} {!isOptionEnabled(airline) && "(Coming Soon)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};