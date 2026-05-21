import * as React from "react"
import { useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import * as LucideIcons from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../overlay/dialog"

// Common icon categories with their icons
const iconCategories = {
  "Common": [
    "Home", "User", "Users", "Settings", "Search", "Plus", "Minus", "X", "Check", 
    "ChevronDown", "ChevronUp", "ChevronLeft", "ChevronRight", "ArrowUp", "ArrowDown", 
    "ArrowLeft", "ArrowRight", "Star", "Heart", "Bookmark", "Share", "Download", "Upload"
  ],
  "Actions": [
    "Edit", "Trash2", "Save", "Copy", "Cut", "Paste", "Undo", "Redo", "RefreshCw", 
    "RotateCcw", "RotateCw", "ZoomIn", "ZoomOut", "Maximize", "Minimize", "Play", 
    "Pause", "Stop", "SkipForward", "SkipBack", "Volume2", "VolumeX"
  ],
  "Interface": [
    "Menu", "MoreHorizontal", "MoreVertical", "Grid", "List", "Layout", "Sidebar", 
    "PanelLeft", "PanelRight", "Tabs", "Window", "Square", "Circle", "Triangle", 
    "Hexagon", "Diamond", "Layers", "Filter", "SortAsc", "SortDesc"
  ],
  "Communication": [
    "Mail", "MessageCircle", "MessageSquare", "Phone", "PhoneCall", "Video", 
    "Mic", "MicOff", "Bell", "BellOff", "Send", "Reply", "Forward", "AtSign", 
    "Hash", "Smile", "Frown", "Meh", "ThumbsUp", "ThumbsDown"
  ],
  "Files & Folders": [
    "File", "FileText", "Folder", "FolderOpen", "Image", "FileImage", "Music", 
    "FileAudio", "Video", "FileVideo", "Archive", "Download", "Upload", "Link", 
    "Paperclip", "Scissors", "FileCheck", "FilePlus", "FileMinus", "FileX"
  ],
  "Business": [
    "Briefcase", "Building", "Building2", "Factory", "Store", "ShoppingCart", 
    "ShoppingBag", "CreditCard", "Banknote", "Coins", "TrendingUp", "TrendingDown", 
    "BarChart", "PieChart", "LineChart", "Target", "Award", "Trophy", "Medal", "Crown"
  ],
  "Technology": [
    "Smartphone", "Laptop", "Monitor", "Tablet", "Watch", "Headphones", "Camera", 
    "Printer", "Scanner", "HardDrive", "Cpu", "MemoryStick", "Wifi", "WifiOff", 
    "Bluetooth", "Battery", "BatteryLow", "Power", "PowerOff", "Zap"
  ],
  "Navigation": [
    "Map", "MapPin", "Navigation", "Compass", "Route", "Car", "Plane", "Train", 
    "Bus", "Bike", "Walk", "Truck", "Ship", "Anchor", "Globe", "Clock", "Calendar", 
    "CalendarDays", "Timer", "Stopwatch"
  ],
  "Weather": [
    "Sun", "Moon", "Cloud", "CloudRain", "CloudSnow", "CloudLightning", "Zap", 
    "Umbrella", "Wind", "Thermometer", "Droplets", "Snowflake", "Rainbow", 
    "Sunrise", "Sunset", "Eye", "EyeOff", "Flashlight"
  ],
  "Social": [
    "Users", "UserPlus", "UserMinus", "UserCheck", "UserX", "Team", "Crown", 
    "Shield", "ShieldCheck", "Lock", "Unlock", "Key", "Fingerprint", "Eye", 
    "EyeOff", "Glasses", "Handshake", "ThumbsUp", "ThumbsDown", "Heart"
  ]
}

// Get all available icons from lucide-react
const getAllIcons = () => {
  const allIcons: string[] = []
  Object.values(iconCategories).forEach(categoryIcons => {
    allIcons.push(...categoryIcons)
  })
  return [...new Set(allIcons)].sort()
}

interface IconSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function IconSelector({
  value,
  onValueChange,
  placeholder = "Select an icon...",
  className,
  disabled = false,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const allIcons = getAllIcons()
  
  // Filter icons based on search term and category
  const filteredIcons = React.useMemo(() => {
    let icons = allIcons
    
    if (selectedCategory !== "All") {
      icons = iconCategories[selectedCategory as keyof typeof iconCategories] || []
    }
    
    if (searchTerm) {
      icons = icons.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return icons
  }, [searchTerm, selectedCategory, allIcons])

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  const selectedIcon = value ? renderIcon(value) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedIcon}
            <span>{value || placeholder}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[300px] w-full">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {Object.keys(iconCategories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-3">
                {filteredIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName]
                  if (!IconComponent) return null
                  
                  return (
                    <button
                      key={iconName}
                      onClick={() => {
                        onValueChange?.(iconName)
                        setOpen(false)
                      }}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-4 rounded-md hover:bg-accent transition-colors min-h-[80px]",
                        value === iconName && "bg-accent"
                      )}
                      title={iconName}
                    >
                      <IconComponent className="h-6 w-6 mb-1" />
                      <span className="text-xs truncate w-full text-center text-gray-700 dark:text-gray-300">
                        {iconName}
                      </span>
                      {value === iconName && (
                        <Check className="h-3 w-3 absolute top-1 right-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No icons found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
          
          {value && (
            <Button
              variant="outline"
              onClick={() => {
                onValueChange?.("")
                setOpen(false)
              }}
              className="w-full"
            >
              Clear Selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}