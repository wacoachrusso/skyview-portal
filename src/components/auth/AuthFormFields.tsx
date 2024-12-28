import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormFieldsProps {
  formData: {
    email: string;
    password: string;
    fullName: string;
    jobTitle: string;
    airline: string;
  };
  showPassword: boolean;
  setFormData: (data: any) => void;
  setShowPassword: (show: boolean) => void;
}

const airlines = [
  "United Airlines",
  "American Airlines",
  "Delta Air Lines",
  "Southwest Airlines",
  "Other"
];

const jobTitles = [
  "Flight Attendant",
  "Pilot"
];

const validatePassword = (password: string) => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};:'"|,.<>?/`~]/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    isValid: hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && isLongEnough,
    requirements: [
      { met: hasLowerCase, text: "Include at least one lowercase letter (a-z)" },
      { met: hasUpperCase, text: "Include at least one uppercase letter (A-Z)" },
      { met: hasNumber, text: "Include at least one number (0-9)" },
      { met: hasSpecialChar, text: "Include at least one special character (!@#$%^&*)" },
      { met: isLongEnough, text: "Be at least 8 characters long" }
    ]
  };
};

export const AuthFormFields = ({ formData, showPassword, setFormData, setShowPassword }: AuthFormFieldsProps) => {
  const isOptionEnabled = (airline: string, jobTitle: string) => {
    if (airline) {
      return airline.toLowerCase() === "united airlines";
    }
    if (jobTitle) {
      return jobTitle.toLowerCase() === "flight attendant";
    }
    return true;
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="bg-white/10 border-white/20 text-white"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-200">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white/10 border-white/20 text-white"
          required
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-gray-200">Password</Label>
        <div className="space-y-2">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`bg-white/10 border-white/20 text-white pr-10 ${!passwordValidation.isValid && formData.password ? 'border-red-500' : ''}`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="text-sm text-gray-400">
            Password requirements:
            <div className="mt-1 space-y-1">
              {passwordValidation.requirements.map((req, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 ${req.met ? 'text-green-500' : 'text-gray-400'}`}
                >
                  <span className="text-xs">
                    {req.met ? '✓' : '○'}
                  </span>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Label htmlFor="jobTitle" className="text-gray-200">Select Job Title</Label>
        <Select 
          value={formData.jobTitle}
          onValueChange={(value) => setFormData({ ...formData, jobTitle: value })}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select Job Title" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20 text-white z-50">
            {jobTitles.map((title) => (
              <SelectItem 
                key={title} 
                value={title.toLowerCase()}
                className={`hover:bg-white/10 ${!isOptionEnabled("", title.toLowerCase()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isOptionEnabled("", title.toLowerCase())}
              >
                {title} {!isOptionEnabled("", title.toLowerCase()) && "(Coming Soon)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Label htmlFor="airline" className="text-gray-200">Select Airline</Label>
        <Select
          value={formData.airline}
          onValueChange={(value) => setFormData({ ...formData, airline: value })}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select Airline" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20 text-white z-50">
            {airlines.map((airline) => (
              <SelectItem 
                key={airline} 
                value={airline.toLowerCase()}
                className={`hover:bg-white/10 ${!isOptionEnabled(airline.toLowerCase(), "") ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isOptionEnabled(airline.toLowerCase(), "")}
              >
                {airline} {!isOptionEnabled(airline.toLowerCase(), "") && "(Coming Soon)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};