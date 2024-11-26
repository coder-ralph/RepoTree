import React, { useState } from 'react';

import { DirectoryMap } from '@/lib/repo-tree-utils';
import { TreeCustomizationOptions } from '@/types/tree-customization';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';

import '@/styles/treeview.css';

interface TreeNodeProps {
  name: string;
  content: DirectoryMap | { type: 'file' };
  depth: number;
  customizationOptions: TreeCustomizationOptions;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  content,
  depth,
  customizationOptions,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const getIndentationClass = () => {
    return `tree-node-expanded-${depth * 2}`;
  };

  const getIconComponent = () => {
    if (!customizationOptions.useIcons) return null;
    return content instanceof Map ? <Folder size={16} /> : <File size={16} />;
  };

  if (content instanceof Map) {
    return (
      <div>
        <div
          className={`tree-node ${getIndentationClass()}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {getIconComponent()}
          <span className="tree-node-name">{name}</span>
        </div>
        {isExpanded && (
          <div>
            {Array.from(content.entries()).map(([key, value]) => (
              <TreeNode
                key={key}
                name={key}
                content={value}
                depth={depth + 1}
                customizationOptions={customizationOptions}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className={`tree-node tree-node-file ${getIndentationClass()}`}>
        {getIconComponent()}
        <span className="tree-node-name">{name}</span>
      </div>
    );
  }
};

interface InteractiveTreeViewProps {
  structure: DirectoryMap;
  customizationOptions: TreeCustomizationOptions;
}

const InteractiveTreeView: React.FC<InteractiveTreeViewProps> = ({
  structure,
  customizationOptions,
}) => {
  return (
    <div className="bg-gray-800 text-green-400 p-6 rounded-lg overflow-x-auto mt-6">
      {Array.from(structure.entries()).map(([key, value]) => (
        <TreeNode
          key={key}
          name={key}
          content={value}
          depth={0}
          customizationOptions={customizationOptions}
        />
      ))}
    </div>
  );
};

export default InteractiveTreeView;
