import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const jobTitles = ["Flight Attendant", "Pilot"];
const airlines = ["United Airlines", "American Airlines", "Delta Airlines", "Southwest Airlines", "Alaska Airlines", "Other"];

const isOptionEnabled = (airline: string, jobTitle: string) => {
  return !(jobTitle.toLowerCase() === "flight attendant" && airline.toLowerCase() === "delta airlines");
};

export const JobAndAirlineSelector = ({ form }: { form: any }) => {
  const jobTitle = form.watch("jobTitle");

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Job Title</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-background border-input focus:ring-brand-gold">
                <SelectValue placeholder="Select Job Title" />
              </SelectTrigger>
              <SelectContent className="bg-[#020817] border-white/10">
                {jobTitles.map((title) => (
                  <SelectItem key={title} value={title.toLowerCase()}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="airline"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Airline</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-background border-input focus:ring-brand-gold">
                <SelectValue placeholder="Select Airline" />
              </SelectTrigger>
              <SelectContent className="bg-[#020817] border-white/10">
                {airlines.map((airline) => {
                  const disabled = !isOptionEnabled(airline, jobTitle);
                  return (
                    <SelectItem
                      key={airline}
                      value={airline.toLowerCase()}
                      disabled={disabled}
                      className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {airline} {disabled && "(Coming Soon)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
};
