'use client';

import React, { useState } from 'react';
import type { DirectoryMap } from '@/lib/repo-tree-utils';
import type { TreeCustomizationOptions } from '@/types/tree-customization';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  FileText,
  Code,
  Settings,
  Database,
  Archive,
  Music,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import '@/styles/treeview.css';

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const name = filename.toLowerCase();
  const p = { size: 15 };

  if (['dockerfile', 'dockerfile.dev', 'dockerfile.prod'].includes(name))
    return <Code {...p} className="text-blue-400" />;
  if (['makefile', 'cmake'].includes(name))
    return <Settings {...p} className="text-green-600" />;
  if (['readme.md', 'readme.txt', 'readme'].includes(name))
    return <FileText {...p} className="text-blue-400" />;
  if (['.gitignore', '.gitattributes'].includes(name))
    return <Settings {...p} className="text-orange-400" />;
  if (['package.json', 'package-lock.json'].includes(name))
    return <Settings {...p} className="text-red-500" />;

  switch (ext) {
    case 'ts': case 'tsx': return <Code {...p} className="text-blue-500" />;
    case 'js': case 'jsx': case 'mjs': return <Code {...p} className="text-yellow-400" />;
    case 'css': case 'scss': case 'sass': return <Code {...p} className="text-pink-400" />;
    case 'html': case 'htm': return <Code {...p} className="text-orange-500" />;
    case 'py': return <Code {...p} className="text-blue-600" />;
    case 'go': return <Code {...p} className="text-cyan-500" />;
    case 'rs': return <Code {...p} className="text-orange-600" />;
    case 'java': case 'kt': return <Code {...p} className="text-orange-500" />;
    case 'rb': return <Code {...p} className="text-red-500" />;
    case 'php': return <Code {...p} className="text-purple-500" />;
    case 'json': case 'jsonc': return <Settings {...p} className="text-yellow-500" />;
    case 'yaml': case 'yml': return <Settings {...p} className="text-red-500" />;
    case 'toml': return <Settings {...p} className="text-yellow-700" />;
    case 'sql': return <Database {...p} className="text-orange-400" />;
    case 'md': case 'mdx': return <FileText {...p} className="text-gray-400" />;
    case 'pdf': return <FileText {...p} className="text-red-500" />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': case 'ico':
      return <ImageIcon {...p} className="text-purple-400" />;
    case 'svg': return <ImageIcon {...p} className="text-yellow-500" />;
    case 'mp3': case 'wav': case 'ogg': return <Music {...p} className="text-green-400" />;
    case 'mp4': case 'webm': case 'mov': return <Video {...p} className="text-red-400" />;
    case 'zip': case 'tar': case 'gz': case 'rar': return <Archive {...p} className="text-yellow-400" />;
    case 'sh': case 'bash': case 'zsh': return <Code {...p} className="text-green-400" />;
    default: return <File {...p} className="text-gray-400" />;
  }
};

const sortEntries = (
  entries: [string, DirectoryMap | { type: 'file' }][],
  sortOrder: TreeCustomizationOptions['sortOrder']
): [string, DirectoryMap | { type: 'file' }][] => {
  return [...entries].sort(([keyA, valueA], [keyB, valueB]) => {
    const isDirA = valueA instanceof Map;
    const isDirB = valueB instanceof Map;

    if (sortOrder === 'default') {
      if (isDirA !== isDirB) return isDirA ? -1 : 1;
      return keyA.localeCompare(keyB);
    }

    if (sortOrder === 'name-asc') {
      return keyA.localeCompare(keyB);
    }

    return keyB.localeCompare(keyA);
  });
};

interface TreeNodeProps {
  name: string;
  content: DirectoryMap | { type: 'file' };
  depth: number;
  customizationOptions: TreeCustomizationOptions;
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, content, depth, customizationOptions }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isFolder = content instanceof Map;
  const sortOrder = customizationOptions.sortOrder ?? 'default';

  const getIndentClass = () => `tree-node-depth-${Math.min(depth, 8)}`;

  if (isFolder) {
    return (
      <div className="select-none">
        <div
          className={`tree-node ${getIndentClass()}`}
          onClick={() => setIsExpanded((v) => !v)}
          style={{ cursor: 'pointer' }}
        >
          <span className="tree-expand-icon">
            {isExpanded
              ? <ChevronDown size={11} className="text-gray-400" />
              : <ChevronRight size={11} className="text-gray-400" />}
          </span>
          <span className="tree-node-icon">
            {customizationOptions.useIcons && (
              isExpanded
                ? <FolderOpen size={15} className="text-blue-400" />
                : <Folder size={15} className="text-blue-400" />
            )}
          </span>
          <span className="tree-node-name">{name}</span>
        </div>

        <div style={{ height: isExpanded ? 'auto' : 0, overflow: 'hidden' }}>
          {isExpanded && sortEntries(Array.from(content.entries()), sortOrder)
            .map(([childName, childContent]) => (
              <TreeNode
                key={childName}
                name={childName}
                content={childContent}
                depth={depth + 1}
                customizationOptions={customizationOptions}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`tree-node tree-node-file ${getIndentClass()}`}>
      <span className="tree-expand-icon">
        <div className="w-3 h-3" />
      </span>
      <span className="tree-node-icon">
        {customizationOptions.useIcons && getFileIcon(name)}
      </span>
      <span className="tree-node-name">{name}</span>
    </div>
  );
};

interface Props {
  structure: DirectoryMap;
  customizationOptions: TreeCustomizationOptions;
}

const InteractiveTreeView: React.FC<Props> = ({ structure, customizationOptions }) => {
  if (!structure || structure.size === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-6">
        No files to display
      </div>
    );
  }

  const sortOrder = customizationOptions.sortOrder ?? 'default';

  return (
    <div className="tree-container">
      {sortEntries(Array.from(structure.entries()), sortOrder)
        .map(([name, content]) => (
          <TreeNode
            key={name}
            name={name}
            content={content}
            depth={0}
            customizationOptions={customizationOptions}
          />
        ))}
    </div>
  );
};

export default InteractiveTreeView;