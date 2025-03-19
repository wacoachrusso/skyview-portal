
import { PasswordResetForm } from "@/components/auth/password-reset/PasswordResetForm";

interface ResetFormStateProps {
  onSubmit: (newPassword: string) => Promise<void>;
  loading: boolean;
}

export const ResetFormState = ({ onSubmit, loading }: ResetFormStateProps) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
      <p className="mt-2 text-sm text-gray-400 text-center">
        Create a new password for your account
      </p>
      <div className="w-full mt-6">
        <PasswordResetForm onSubmit={onSubmit} loading={loading} />
      </div>
    </>
  );
};
