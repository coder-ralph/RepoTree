'use client';

import type React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { TreeCustomizationOptions } from '@/types/tree-customization';

interface Props {
  options: TreeCustomizationOptions;
  onChange: (newOptions: Partial<TreeCustomizationOptions>) => void;
}

const CustomizationOptions: React.FC<Props> = ({ options, onChange }) => {
  return (
    <div className="space-y-4 py-1">
      {/* ASCII Style */}
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

      {/* Options list */}
      {([
        { id: 'useIcons', label: 'Use icons', note: 'Both views' },
        { id: 'showLineNumbers', label: 'Line numbers', note: 'ASCII only' },
        { id: 'showDescriptions', label: 'Descriptions', note: 'ASCII only' },
        { id: 'showRootDirectory', label: 'Root folder name', note: 'ASCII only' },
        { id: 'showTrailingSlash', label: 'Trailing slash', note: 'ASCII only' },
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
