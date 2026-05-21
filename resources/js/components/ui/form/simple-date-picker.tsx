import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"

interface SimpleDatePickerProps {
  value?: string | Date | null
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SimpleDatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false
}: SimpleDatePickerProps) {
  const { t } = useTranslations()
  // Convert value to string format for input
  const inputValue = React.useMemo(() => {
    if (!value) return ""
    if (typeof value === "string") {
      // If it's already a string, check if it's in the right format
      if (value.includes("T")) {
        return value.split("T")[0] // Extract date part from datetime
      }
      return value
    }
    if (value instanceof Date) {
      return value.toISOString().split("T")[0]
    }
    return ""
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <input
      type="date"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder || t('Select date')}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}