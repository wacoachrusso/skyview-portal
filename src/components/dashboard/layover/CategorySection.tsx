
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pizza, Palmtree, Users, Bed, Building } from "lucide-react";

interface Item {
  name: string;
  description: string;
  rating: number;
}

interface CategorySectionProps {
  category: string;
  items: Item[];
  isOpen: boolean;
  onToggle: () => void;
}

export const CategorySection = ({ category, items, isOpen, onToggle }: CategorySectionProps) => {
  const getIconForCategory = (category: string) => {
    switch(category) {
      case 'foodAndCoffee':
        return <Pizza className="h-5 w-5 text-brand-orange" />;
      case 'thingsToDo':
        return <Palmtree className="h-5 w-5 text-brand-emerald" />;
      case 'crewTips':
        return <Users className="h-5 w-5 text-brand-blue" />;
      case 'restAndRecovery':
        return <Bed className="h-5 w-5 text-brand-purple" />;
      default:
        return <Building className="h-5 w-5 text-brand-navy" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch(category) {
      case 'foodAndCoffee':
        return 'Food & Coffee';
      case 'thingsToDo':
        return 'Things to Do';
      case 'crewTips':
        return 'Crew Tips';
      case 'restAndRecovery':
        return 'Rest & Recovery';
      default:
        return category;
    }
  };

  return (
    <Collapsible 
      open={isOpen}
      onOpenChange={onToggle}
      className="space-y-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left hover:bg-slate-200 dark:hover:bg-slate-700">
        <h3 className="flex items-center text-lg font-semibold">
          {getIconForCategory(category)}
          <span className="ml-2 text-foreground">
            {getCategoryTitle(category)}
          </span>
        </h3>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="h-56 pr-4">
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Card 
                key={index} 
                className="border-brand-slate/10 transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => console.log(`Clicked on ${item.name}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-medium">{item.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center rounded-full bg-brand-purple/10 px-2 py-1 text-xs font-medium text-brand-purple">
                      {item.rating}★
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
