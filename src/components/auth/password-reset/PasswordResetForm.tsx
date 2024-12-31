import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordResetFormProps {
  onSubmit: (newPassword: string) => Promise<void>;
  loading: boolean;
}

export const PasswordResetForm = ({ onSubmit, loading }: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const validatePassword = (password: string): { isValid: boolean; requirements: { met: boolean; text: string }[] } => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      const unmetRequirements = validation.requirements
        .filter(req => !req.met)
        .map(req => req.text)
        .join(", ");
      
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: `Password requirements not met: ${unmetRequirements}`
      });
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical"
      });
      return;
    }

    await onSubmit(newPassword);
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-md w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className={`w-full pr-10 ${!passwordValidation.isValid && newPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Password requirements:
            <div className="mt-1 space-y-1">
              {passwordValidation.requirements.map((req, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 ${req.met ? 'text-green-500' : 'text-gray-500'}`}
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className={`w-full pr-10 ${
                confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};