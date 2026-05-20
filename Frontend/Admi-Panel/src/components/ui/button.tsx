import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: '#12D6C5',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 10px 25px rgba(18,214,197,0.25)',
      },
      outline: {
        background: 'transparent',
        border: '1px solid #E5E7EB',
        color: '#111827',
      },
      ghost: {
        background: 'transparent',
        border: 'none',
        color: '#111827',
      },
      danger: {
        background: '#EF4444',
        color: '#FFFFFF',
        border: 'none',
      },
    }

    const sizeClasses = {
      default: "h-12 px-5",
      sm: "h-9 px-3 text-xs",
      lg: "h-[52px] px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-[14px] text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          sizeClasses[size],
          className
        )}
        style={{ ...variantStyles[variant], ...style }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
