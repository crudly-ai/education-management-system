import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/form/button"
import { Input } from "@/components/ui/form/input"

interface StepperProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function Stepper({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1
}: StepperProps) {
  const increment = () => {
    const newValue = Math.min(value + step, max)
    onChange?.(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(value - step, min)
    onChange?.(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onChange?.(clampedValue)
  }

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={value <= min}
        className="rounded-r-none px-2"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="rounded-none border-x-0 text-center w-20"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={value >= max}
        className="rounded-l-none px-2"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}