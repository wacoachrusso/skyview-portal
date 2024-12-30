import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordResetFormProps {
  onSubmit: (newPassword: string, confirmPassword: string) => Promise<void>;
  loading: boolean;
}

export const PasswordResetForm = ({ onSubmit, loading }: PasswordResetFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newPassword, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            className="w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};