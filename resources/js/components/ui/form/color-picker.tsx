import * as React from "react"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/form/button"
import { Input } from "@/components/ui/form/input"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
}

export function ColorPicker({ value = "#000000", onChange }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const presetColors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
    "#ffc0cb", "#a52a2a", "#808080", "#000080", "#008000"
  ]

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex gap-2">
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          className="w-12 h-10 p-0"
          style={{ backgroundColor: value }}
          onClick={() => setOpen(!open)}
        >
          <Palette className="h-4 w-4" style={{ color: value === "#ffffff" ? "#000" : "#fff" }} />
        </Button>
        
        {open && (
          <div className="absolute top-full left-0 z-[9999] mt-1 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
            <div className="space-y-3">
              <div>
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              
              <div>
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  placeholder="#000000"
                  className="w-full"
                />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Preset Colors</p>
                <div className="grid grid-cols-5 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onChange?.(color)
                        setOpen(false)
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
    </div>
  )
}