import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File } from 'lucide-react';
import { DirectoryMap } from '@/lib/repo-tree-utils';
import '@/styles/treeview.css';

interface TreeNodeProps {
  name: string;
  content: DirectoryMap | { type: 'file' };
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, content, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const paddingClass = `tree-node-expanded-${depth}`;

  if (content instanceof Map) {
    return (
      <div>
        <div
          className={`tree-node ${paddingClass}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="tree-node-name">{name}</span>
        </div>
        {isExpanded && (
          <div>
            {Array.from(content.entries()).map(([key, value]) => (
              <TreeNode key={key} name={key} content={value} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className={`tree-node tree-node-file ${paddingClass}`}>
        <File size={16} />
        <span className="tree-node-name">{name}</span>
      </div>
    );
  }
};

interface InteractiveTreeViewProps {
  structure: DirectoryMap;
}

const InteractiveTreeView: React.FC<InteractiveTreeViewProps> = ({ structure }) => {
  return (
    <div className="bg-gray-800 text-green-400 p-6 rounded-lg overflow-x-auto mt-6">
      {Array.from(structure.entries()).map(([key, value]) => (
        <TreeNode key={key} name={key} content={value} depth={0} />
      ))}
    </div>
  );
};

export default InteractiveTreeView;
