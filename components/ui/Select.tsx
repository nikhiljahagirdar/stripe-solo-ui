import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
  variant?: 'default' | 'filled' | 'outlined'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, variant = 'default', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative group">
        <select
          className={cn(
            "w-full bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none py-3 px-4 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
            "pr-10", // Space for dropdown arrow
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-5 h-5 text-neutral-400 transition-transform group-hover:rotate-180" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>
        
        {(error || helperText) && (
          <p className={cn(
            "text-xs animate-slide-up",
            error ? "text-error font-medium" : "text-neutral-500 dark:text-neutral-400"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }