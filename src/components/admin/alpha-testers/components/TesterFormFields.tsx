import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface FormData {
  email: string;
  fullName: string;
  password: string;
  isPromoter: boolean;
}

interface TesterFormFieldsProps {
  register: UseFormRegister<FormData>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  generatePassword: () => void;
  isPromoter: boolean;
}

export const TesterFormFields = ({
  register,
  showPassword,
  setShowPassword,
  generatePassword,
  isPromoter,
}: TesterFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: true })}
          placeholder="Enter tester's email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          {...register("fullName", { required: true })}
          placeholder="Enter tester's full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true })}
            placeholder="Enter password"
            className="pr-20"
          />
          <div className="absolute right-0 top-0 flex h-full items-center space-x-1 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={generatePassword}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isPromoter" {...register("isPromoter")} />
        <Label htmlFor="isPromoter">Add as Promoter</Label>
      </div>
    </>
  );
};