import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { PasswordInput } from "./components/PasswordInput";
import { PasswordRequirements } from "./components/PasswordRequirements";
import { validatePassword } from "./utils/passwordValidation";
import { usePasswordUpdate } from "./hooks/usePasswordUpdate";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { updatePassword, loading } = usePasswordUpdate(onSuccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePassword(newPassword, confirmPassword);
  };

  const validation = validatePassword(newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-md w-full">
      <div className="space-y-4">
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          disabled={loading}
          label="New Password"
        />
        <PasswordRequirements requirements={validation.requirements} />

        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          disabled={loading}
          isError={confirmPassword && newPassword !== confirmPassword}
          label="Confirm Password"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading}
      >
        <Lock className="mr-2 h-4 w-4" />
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
};