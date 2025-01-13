import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TesterFormFields } from "./components/TesterFormFields";
import { useAddTester } from "./hooks/useAddTester";

interface NewTesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  fullName: string;
  password: string;
  isPromoter: boolean;
}

export const NewTesterDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NewTesterDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      isPromoter: false
    }
  });

  const { addTester, isSubmitting, generatePassword } = useAddTester(onSuccess);
  const isPromoter = watch('isPromoter');

  const handleGeneratePassword = () => {
    setValue('password', generatePassword());
  };

  const onSubmit = async (data: FormData) => {
    const success = await addTester(data);
    if (success) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {isPromoter ? 'Promoter' : 'Alpha Tester'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TesterFormFields
            register={register}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            generatePassword={handleGeneratePassword}
            isPromoter={isPromoter}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : `Add ${isPromoter ? 'Promoter' : 'Tester'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};