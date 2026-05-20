import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[14px] border bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] transition-all outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F7F9FC]",
          "border-[#E5E7EB] focus:border-[#12D6C5] focus:shadow-[0_0_0_4px_rgba(18,214,197,0.15)]",
          "min-h-[52px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
