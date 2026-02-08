import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'glass' | 'elevated' | 'outlined'
    interactive?: boolean;
  }
>(({ className, variant = 'default', interactive, ...props }, ref) => {
  const { interactive: _, ...domProps } = { interactive, ...props };
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-200",
        {
          "card-modern hover-lift": variant === 'default',
          "glass-effect hover:bg-white/90": variant === 'glass',
          "bg-white shadow-xl hover:shadow-2xl hover-lift border border-neutral-100": variant === 'elevated',
          "bg-white border-2 border-neutral-200 hover:border-neutral-300": variant === 'outlined',
          "dark:bg-neutral-900 dark:border-neutral-800": variant !== 'glass',
          "dark:hover:bg-neutral-800": variant === 'glass',
        },
        className
      )}
      {...domProps}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean
    title?: string
  }
>(({ className, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      {
        "bg-blue-500 text-white": gradient,
        "border-b border-gray-100 dark:border-gray-800": !gradient,
      },
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, size = 'lg', ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      {
        "text-lg": size === 'sm',
        "text-xl": size === 'md',
        "text-2xl": size === 'lg',
        "text-3xl": size === 'xl',
      },
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'base' | 'lg'
  }
>(({ className, size = 'sm', ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-muted-foreground",
      {
        "text-xs": size === 'sm',
        "text-sm": size === 'base',
        "text-base": size === 'lg',
      },
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 animate-slide-up", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    border?: boolean
  }
>(({ className, border = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      {
        "border-t border-neutral-100 dark:border-neutral-800 mt-6 pt-6": border,
      },
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }