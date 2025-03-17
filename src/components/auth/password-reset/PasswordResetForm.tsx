
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordRequirements } from "./components/PasswordRequirements";
import { validatePassword } from "./utils/passwordValidation";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-1">
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
              className="bg-white/10 border-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordRequirements requirements={passwordValidation.requirements} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
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
              className={`bg-white/10 border-white/20 text-white pr-10 ${
                confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold"
        disabled={loading}
      >
        {loading ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );
};
