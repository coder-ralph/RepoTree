"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { TreeCustomizationOptions } from "@/types/tree-customization"

interface CustomizationOptionsProps {
  options: TreeCustomizationOptions
  onChange: (newOptions: Partial<TreeCustomizationOptions>) => void
}

const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({ options, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="ascii-style">ASCII Style</Label>
        <Select
          value={options.asciiStyle}
          onValueChange={(value) => onChange({ asciiStyle: value as "basic" | "detailed" | "minimal" })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select ASCII style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Use Icons */}
      <div className="flex items-center justify-between">
        <Label htmlFor="use-icons">Use Icons</Label>
        <Switch
          id="use-icons"
          checked={options.useIcons}
          onCheckedChange={(checked: boolean) => onChange({ useIcons: checked })}
        />
      </div>
      {/* Show Line Numbers */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-line-numbers">Show Line Numbers</Label>
        <Switch
          id="show-line-numbers"
          checked={options.showLineNumbers}
          onCheckedChange={(checked: boolean) => onChange({ showLineNumbers: checked })}
        />
      </div>
      {/* Root Directory */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-root-directory">Root Directory</Label>
        <Switch
          id="show-root-directory"
          checked={options.showRootDirectory}
          onCheckedChange={(checked: boolean) => onChange({ showRootDirectory: checked })}
        />
      </div>
      {/* Trailing Slash */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-trailing-slash">Trailing Slash</Label>
        <Switch
          id="show-trailing-slash"
          checked={options.showTrailingSlash}
          onCheckedChange={(checked: boolean) => onChange({ showTrailingSlash: checked })}
        />
      </div>
    </div>
  )
}

export default CustomizationOptions
