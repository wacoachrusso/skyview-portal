import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface CTAProps {
  badge?: {
    text: string
  }
  title: string
  description?: string
  action: {
    text: string
    href: string
    variant?: "default" | "secondary" | "outline"
  }
  withGlow?: boolean
  className?: string
}

export function CTASection({
  badge,
  title,
  description,
  action,
  withGlow = true,
  className,
}: CTAProps) {
  return (
    <section className={cn("overflow-hidden pt-0 md:pt-0", className)}>
      <div className="relative mx-auto flex max-w-container flex-col items-center gap-6 px-8 py-12 text-center sm:gap-8 md:py-24">
        {badge && (
          <Badge
            variant="outline"
            className="opacity-0 animate-fade-up delay-100"
          >
            <span className="text-brand-gold">{badge.text}</span>
          </Badge>
        )}

        <h2 className="text-3xl font-semibold sm:text-5xl opacity-0 animate-fade-up delay-200">
          {title}
        </h2>

        {description && (
          <p className="text-muted-foreground max-w-2xl opacity-0 animate-fade-up delay-300">
            {description}
          </p>
        )}

        <Button
          variant={action.variant || "default"}
          size="lg"
          className="opacity-0 animate-fade-up delay-500 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold"
          asChild
        >
          <Link to={action.href}>{action.text}</Link>
        </Button>

        {withGlow && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-brand-gold/5 to-transparent opacity-0 animate-fade-in delay-700" />
        )}
      </div>
    </section>
  )
}