import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AuthInputFieldProps {
  name: "fullName" | "email" | "password";
  label: string;
  type?: string;
  placeholder?: string;
  form: any;
}

export const AuthInputField = ({
  name,
  label,
  type = "text",
  placeholder,
  form,
}: AuthInputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>

          {name === "password" ? (
            <div className="relative">
              <FormControl>
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder || "••••••••"}
                  autoComplete="current-password"
                  className="bg-background border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c py-6"
                />
              </FormControl>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          ) : (
            <FormControl>
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                autoComplete={name}
                className="bg-background border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c] py-6"
              />
            </FormControl>
          )}

          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};
