
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pizza, Palmtree, Users, Bed, Building, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [activeItem, setActiveItem] = useState<number | null>(null);
  
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

  const handleItemClick = (index: number, item: Item) => {
    setActiveItem(index === activeItem ? null : index);
    console.log(`Selected recommendation: ${item.name}`);
    // In a real implementation, this could open a detail view or map
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
        <ScrollArea className="h-48 pr-4"> {/* Reduced height */}
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-2"> {/* Reduced to 2 columns max */}
            {items.map((item, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className={`border-brand-slate/10 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        activeItem === index ? 'ring-2 ring-brand-purple/50 shadow-md' : ''
                      }`}
                      onClick={() => handleItemClick(index, item)}
                    >
                      <CardContent className="p-3 flex items-start justify-between"> {/* Reduced padding */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate flex items-center">
                            {item.name}
                            <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center rounded-full bg-brand-purple/10 px-2 py-1 text-xs font-medium text-brand-purple ml-2 shrink-0">
                          {item.rating}★
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click for more details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
