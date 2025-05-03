import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AuthInputFieldProps {
  name: "fullName" | "email" | "password";
  label: string;
  type?: string;
  placeholder?: string;
  form: any;
}

export const AuthInputField = ({ name, label, type = "text", placeholder, form }: AuthInputFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            autoComplete={name}
            className="bg-background border-white/10 focus-visible:ring-brand-gold autofill:shadow-[inset_0_0_0px_1000px_#0e101c]"
          />
        </FormControl>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);
