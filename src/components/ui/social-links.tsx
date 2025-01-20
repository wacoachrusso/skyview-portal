"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

interface Social {
  name: string
  icon: React.ReactNode
  href: string
}

interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: Social[]
}

export function SocialLinks({ socials, className, ...props }: SocialLinksProps) {
  const [hoveredSocial, setHoveredSocial] = React.useState<string | null>(null)
  const [rotation, setRotation] = React.useState<number>(0)
  const [clicked, setClicked] = React.useState<boolean>(false)

  const animation = {
    scale: clicked ? [1, 1.3, 1] : 1,
    transition: { duration: 0.3 },
  }

  React.useEffect(() => {
    const handleClick = () => {
      setClicked(true)
      setTimeout(() => {
        setClicked(false)
      }, 200)
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [clicked])

  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    >
      {socials.map((social, index) => (
        <a
          href={social.href}
          className={cn(
            "relative cursor-pointer transition-opacity duration-200 hover:text-white",
            hoveredSocial && hoveredSocial !== social.name
              ? "opacity-50"
              : "opacity-100"
          )}
          key={index}
          onMouseEnter={() => {
            setHoveredSocial(social.name)
            setRotation(Math.random() * 20 - 10)
          }}
          onMouseLeave={() => setHoveredSocial(null)}
          onClick={() => {
            setClicked(true)
          }}
          aria-label={social.name}
        >
          <motion.div
            className="h-5 w-5"
            animate={animation}
          >
            {social.icon}
          </motion.div>
        </a>
      ))}
    </div>
  )
}