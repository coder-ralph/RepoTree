'use client';

import type React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { TreeCustomizationOptions, SortOrder } from '@/types/tree-customization';

interface Props {
  options: TreeCustomizationOptions;
  onChange: (newOptions: Partial<TreeCustomizationOptions>) => void;
}

const CustomizationOptions: React.FC<Props> = ({ options, onChange }) => {
  return (
    <div className="space-y-4 py-1">
      <div className="flex items-center justify-between">
        <Label htmlFor="ascii-style" className="text-sm">ASCII style</Label>
        <Select
          value={options.asciiStyle}
          onValueChange={(v) => onChange({ asciiStyle: v as 'basic' | 'detailed' | 'minimal' })}
        >
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="sort-order" className="text-sm">Sort order</Label>
        <Select
          value={options.sortOrder}
          onValueChange={(v) => onChange({ sortOrder: v as SortOrder })}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Dirs first (A–Z)</SelectItem>
            <SelectItem value="name-asc">Name (A–Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z–A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="focus-path" className="text-sm">Focus path</Label>
        <Input
          id="focus-path"
          value={options.focusPath}
          onChange={(e) => onChange({ focusPath: e.target.value })}
          placeholder="e.g., src/, packages/ui"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="include-patterns" className="text-sm">Include patterns</Label>
        <Input
          id="include-patterns"
          value={options.includePatterns}
          onChange={(e) => onChange({ includePatterns: e.target.value })}
          placeholder="e.g., *.ts, src, components"
          className="h-8 text-sm"
        />
      </div>

      {([
        { id: 'useIcons', label: 'Use icons', note: 'Both views' },
        { id: 'showLineNumbers', label: 'Line numbers', note: 'ASCII only' },
        { id: 'showDescriptions', label: 'Descriptions', note: 'ASCII only' },
        { id: 'showRootDirectory', label: 'Root folder name', note: 'ASCII only' },
        { id: 'showTrailingSlash', label: 'Trailing slash', note: 'ASCII only' },
        { id: 'hideHiddenFiles', label: 'Hide hidden files', note: 'All views' },
      ] as const).map(({ id, label, note }) => (
        <div key={id} className="flex items-center justify-between">
          <div>
            <Label htmlFor={id} className="text-sm">{label}</Label>
            <p className="text-xs text-gray-400 dark:text-gray-500">{note}</p>
          </div>
          <Switch
            id={id}
            checked={options[id]}
            onCheckedChange={(checked) => onChange({ [id]: checked })}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomizationOptions;
