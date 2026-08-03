import * as React from "react"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "border border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border border-transparent bg-secondary text-secondary-foreground",
    destructive: "border border-transparent bg-destructive text-destructive-foreground shadow",
    outline: "border border-foreground text-foreground"
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ''}`}
      {...props}
    />
  )
}

export { Badge }
