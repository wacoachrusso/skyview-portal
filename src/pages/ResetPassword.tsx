
import { ResetPasswordLayout } from "@/components/auth/password-reset/ResetPasswordLayout";
import { ValidatingState } from "@/components/auth/password-reset/states/ValidatingState";
import { ErrorState } from "@/components/auth/password-reset/states/ErrorState";
import { SuccessState } from "@/components/auth/password-reset/states/SuccessState";
import { ResetFormState } from "@/components/auth/password-reset/states/ResetFormState";
import { useResetTokenValidation } from "@/components/auth/password-reset/hooks/useResetTokenValidation";
import { usePasswordReset } from "@/components/auth/password-reset/hooks/usePasswordReset";

const ResetPassword = () => {
  const { isValidating, isError, errorMessage, isValid } = useResetTokenValidation();
  const { loading, resetSuccess, handleResetPassword } = usePasswordReset();

  return (
    <ResetPasswordLayout>
      {isValidating && <ValidatingState />}
      
      {isError && <ErrorState errorMessage={errorMessage} />}
      
      {resetSuccess && <SuccessState />}
      
      {!isValidating && !isError && !resetSuccess && isValid && (
        <ResetFormState onSubmit={handleResetPassword} loading={loading} />
      )}
    </ResetPasswordLayout>
  );
};

export default ResetPassword;
