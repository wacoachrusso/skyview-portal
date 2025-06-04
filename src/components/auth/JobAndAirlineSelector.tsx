import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AirlinesRoles, Airlines, jobTitles } from "@/data/airlines";

// Utility to filter available airlines per job title
function getAirlinesForJobTitle(jobTitle: string) {
  const lowerTitle = jobTitle.toLowerCase();

  const validAirlineIds = AirlinesRoles.filter(
    (role) => role.name.toLowerCase() === lowerTitle
  ).map((role) => role.airlinesId);

  return Airlines.map((airline) => {
    const isSupported = validAirlineIds.includes(airline.id);
    const isComingSoon = airline.name.toLowerCase() === "southwest airlines";

    return {
      ...airline,
      disabled: !isSupported || isComingSoon,
      label: isComingSoon
        ? `${airline.name} (Coming Soon)`
        : airline.name,
    };
  });
}

export const JobAndAirlineSelector = ({ form }: { form: any }) => {
  const jobTitle = form.watch("jobTitle");

  const filteredAirlines = getAirlinesForJobTitle(jobTitle || "");

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Job Title */}
      <FormField
        control={form.control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Job Title</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-background border-input focus:ring-brand-gold py-6">
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

      {/* Airline */}
      <FormField
        control={form.control}
        name="airline"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Airline</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-background border-input focus:ring-brand-gold py-6">
                <SelectValue placeholder="Select Airline" />
              </SelectTrigger>
              <SelectContent className="bg-[#020817] border-white/10">
                {filteredAirlines.map((airline) => (
                  <SelectItem
                    key={airline.id}
                    value={airline.name.toLowerCase()}
                    disabled={airline.disabled}
                    className={airline.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {airline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
};
