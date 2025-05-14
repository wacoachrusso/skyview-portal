import React from "react";

interface TermsSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export const TermsSection: React.FC<TermsSectionProps> = ({
  icon,
  title,
  children,
}) => {
  return (
    <section>
      <div className="flex items-center gap-2 ">
        <div className="mt-6">{icon}</div>

        <h2 className="text-2xl font-semibold text-[#ffffff]">{title}</h2>
      </div>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
};
