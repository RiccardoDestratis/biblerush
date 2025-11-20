import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_2px_4px_-1px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.2)] active:bg-gradient-to-b active:from-primary/95 active:to-primary/85 hover:shadow-[0_6px_8px_-1px_rgba(0,0,0,0.25),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/90 text-destructive-foreground shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_2px_4px_-1px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.2)] active:bg-gradient-to-b active:from-destructive/95 active:to-destructive/85 hover:shadow-[0_6px_8px_-1px_rgba(0,0,0,0.25),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:-translate-y-0.5",
        outline:
          "border-2 border-accent bg-background shadow-sm text-foreground active:translate-y-0.5 active:bg-gradient-to-br active:from-accent/15 active:to-accent/10 active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-gradient-to-br hover:from-accent/10 hover:to-accent/5 hover:border-accent/80 hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/90 text-secondary-foreground shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15),0_2px_4px_-1px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.15)] active:bg-gradient-to-b active:from-secondary/95 active:to-secondary/85 hover:shadow-[0_6px_8px_-1px_rgba(0,0,0,0.2),0_3px_6px_-1px_rgba(0,0,0,0.12)] hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground active:bg-accent/15",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
