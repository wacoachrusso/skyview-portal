
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TipFormValues {
  category: string;
  name: string;
  description: string;
  location: string;
}

interface TipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airportCode: string;
}

export const TipForm = ({ open, onOpenChange, airportCode }: TipFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<TipFormValues>({
    defaultValues: {
      category: "foodAndCoffee",
      name: "",
      description: "",
      location: ""
    }
  });

  const onSubmitTip = (data: TipFormValues) => {
    console.log('Tip submitted:', {
      airport: airportCode,
      ...data
    });

    toast({
      title: "Tip submitted successfully!",
      description: "Thank you for sharing your recommendation with fellow crew members.",
    });

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share a Tip for {airportCode}</DialogTitle>
          <DialogDescription>
            Help fellow crew members discover great spots during their layover.
            Your tip will be reviewed and may be added to our database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitTip)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="foodAndCoffee">Food & Coffee</SelectItem>
                      <SelectItem value="thingsToDo">Things to Do</SelectItem>
                      <SelectItem value="crewTips">Crew Tips</SelectItem>
                      <SelectItem value="restAndRecovery">Rest & Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of the place" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What makes this place special for crew?"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/Directions</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="How to find it (terminal, nearby landmarks, etc.)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Tip</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
