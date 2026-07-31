import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Hides the live counter even when maxLength is set (rare - most fields should show it). */
  hideCounter?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, hideCounter, value, defaultValue, onChange, ...props }, ref) => {
    // Track length locally so the counter works for both controlled (value=)
    // and uncontrolled (defaultValue=) usage without changing call-site behavior.
    const [length, setLength] = React.useState(() =>
      String(value ?? defaultValue ?? "").length
    )

    React.useEffect(() => {
      if (value !== undefined) setLength(String(value).length)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setLength(e.target.value.length)
      onChange?.(e)
    }

    const showCounter = typeof maxLength === "number" && !hideCounter
    const remaining = typeof maxLength === "number" ? maxLength - length : 0
    const nearLimit = typeof maxLength === "number" && remaining <= Math.max(10, maxLength * 0.1)

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            showCounter && "pb-6",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...props}
        />
        {showCounter && (
          <span
            className={cn(
              "pointer-events-none absolute bottom-1.5 right-2.5 text-xs tabular-nums",
              nearLimit ? "text-destructive" : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
