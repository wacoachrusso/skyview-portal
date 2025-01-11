import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ActionCard = ({ icon: Icon, title, description, onClick }: ActionCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-action-card border border-brand-purple/10 backdrop-blur-sm cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-lg bg-brand-purple/10 group-hover:bg-brand-purple/20 transition-colors">
          <Icon className="h-6 w-6 text-brand-purple" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground/90 group-hover:text-brand-purple transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};