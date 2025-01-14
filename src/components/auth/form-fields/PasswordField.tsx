import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordRequirement {
  met: boolean;
  text: string;
}

interface PasswordFieldProps {
  password: string;
  onChange: (value: string) => void;
}

export const PasswordField = ({ password, onChange }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

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

  const passwordValidation = validatePassword(password);

  return (
    <div>
      <Label htmlFor="password" className="text-gray-200">Password</Label>
      <div className="space-y-2">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-white/10 border-white/20 text-white pr-10 ${!passwordValidation.isValid && password ? 'border-red-500' : ''}`}
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
  );
};