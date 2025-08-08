import React, { useState, useRef } from 'react';

import { DirectoryMap } from '@/lib/repo-tree-utils';
import { TreeCustomizationOptions } from '@/types/tree-customization';
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  Folder, 
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Code,
  Settings,
  Database,
  Archive,
  Music,
  Video,
} from 'lucide-react';

import '@/styles/treeview.css';

// File extension to icon mapping (VS Code style)
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const name = filename.toLowerCase();
  const iconProps = { size: 16 };
  
  // Special file names
  if (name === 'dockerfile' || name === 'dockerfile.dev' || name === 'dockerfile.prod') {
    return <Code {...iconProps} className="text-blue-500" />;
  }
  if (name === 'makefile' || name === 'cmake' || name === 'cmakefile') {
    return <Settings {...iconProps} className="text-green-700" />;
  }
  if (name === 'readme' || name === 'readme.md' || name === 'readme.txt') {
    return <FileText {...iconProps} className="text-blue-500" />;
  }
  if (name === 'license' || name === 'license.md' || name === 'license.txt') {
    return <FileText {...iconProps} className="text-yellow-500" />;
  }
  if (name === '.gitignore' || name === '.gitattributes') {
    return <Settings {...iconProps} className="text-orange-500" />;
  }
  if (name === 'package.json' || name === 'package-lock.json') {
    return <Settings {...iconProps} className="text-red-600" />;
  }
  if (name === 'yarn.lock') {
    return <Settings {...iconProps} className="text-blue-600" />;
  }
  
  switch (ext) {
    // Web Technologies
    case 'js':
    case 'mjs':
      return <Code {...iconProps} className="text-yellow-400" />;
    case 'jsx':
      return <Code {...iconProps} className="text-cyan-400" />;
    case 'ts':
      return <Code {...iconProps} className="text-blue-500" />;
    case 'tsx':
      return <Code {...iconProps} className="text-cyan-400" />;
    case 'html':
    case 'htm':
      return <Code {...iconProps} className="text-orange-500" />;
    case 'css':
      return <Code {...iconProps} className="text-blue-400" />;
    case 'scss':
    case 'sass':
      return <Code {...iconProps} className="text-pink-500" />;
    case 'less':
      return <Code {...iconProps} className="text-blue-800" />;
    case 'vue':
      return <Code {...iconProps} className="text-green-500" />;
    case 'svelte':
      return <Code {...iconProps} className="text-orange-600" />;

    // Backend Languages
    case 'py':
    case 'pyw':
    case 'pyc':
      return <Code {...iconProps} className="text-blue-600" />;
    case 'java':
      return <Code {...iconProps} className="text-orange-600" />;
    case 'class':
    case 'jar':
      return <Archive {...iconProps} className="text-orange-600" />;
    case 'php':
      return <Code {...iconProps} className="text-purple-600" />;
    case 'rb':
      return <Code {...iconProps} className="text-red-600" />;
    case 'go':
      return <Code {...iconProps} className="text-cyan-600" />;
    case 'rs':
      return <Code {...iconProps} className="text-orange-700" />;
    case 'kt':
      return <Code {...iconProps} className="text-purple-500" />;
    case 'scala':
      return <Code {...iconProps} className="text-red-600" />;
    case 'clj':
    case 'cljs':
      return <Code {...iconProps} className="text-blue-500" />;
    case 'ex':
    case 'exs':
      return <Code {...iconProps} className="text-purple-700" />;

    // C Family
    case 'c':
      return <Code {...iconProps} className="text-gray-600" />;
    case 'cpp':
    case 'cc':
    case 'cxx':
      return <Code {...iconProps} className="text-blue-600" />;
    case 'h':
    case 'hpp':
      return <Code {...iconProps} className="text-purple-500" />;
    case 'cs':
      return <Code {...iconProps} className="text-green-600" />;

    // Mobile Development
    case 'swift':
      return <Code {...iconProps} className="text-orange-500" />;
    case 'dart':
      return <Code {...iconProps} className="text-blue-500" />;
    case 'm':
    case 'mm':
      return <Code {...iconProps} className="text-blue-400" />;

    // Functional Languages
    case 'hs':
      return <Code {...iconProps} className="text-purple-700" />;
    case 'ml':
      return <Code {...iconProps} className="text-orange-600" />;
    case 'elm':
      return <Code {...iconProps} className="text-cyan-500" />;
    case 'fs':
    case 'fsx':
      return <Code {...iconProps} className="text-blue-600" />;

    // Scripting
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return <Code {...iconProps} className="text-green-500" />;
    case 'ps1':
      return <Code {...iconProps} className="text-blue-800" />;
    case 'bat':
    case 'cmd':
      return <Code {...iconProps} className="text-yellow-500" />;

    // Data & Config
    case 'json':
    case 'jsonc':
      return <Settings {...iconProps} className="text-yellow-600" />;
    case 'xml':
      return <Code {...iconProps} className="text-orange-600" />;
    case 'yaml':
    case 'yml':
      return <Settings {...iconProps} className="text-red-600" />;
    case 'toml':
      return <Settings {...iconProps} className="text-yellow-800" />;
    case 'ini':
    case 'conf':
      return <Settings {...iconProps} className="text-gray-500" />;
    case 'env':
      return <Settings {...iconProps} className="text-yellow-500" />;

    // Database
    case 'sql':
      return <Database {...iconProps} className="text-orange-500" />;
    case 'db':
    case 'sqlite':
    case 'sqlite3':
      return <Database {...iconProps} className="text-blue-700" />;

    // Documentation
    case 'md':
    case 'markdown':
      return <FileText {...iconProps} className="text-gray-300" />;
    case 'rst':
      return <FileText {...iconProps} className="text-gray-400" />;
    case 'tex':
      return <FileText {...iconProps} className="text-green-700" />;
    case 'pdf':
      return <FileText {...iconProps} className="text-red-600" />;
    case 'doc':
    case 'docx':
      return <FileText {...iconProps} className="text-blue-600" />;
    case 'ppt':
    case 'pptx':
      return <FileText {...iconProps} className="text-orange-600" />;
    case 'xls':
    case 'xlsx':
      return <FileText {...iconProps} className="text-green-600" />;

    // Images
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'tiff':
    case 'webp':
    case 'ico':
      return <ImageIcon {...iconProps} className="text-purple-400" />;
    case 'svg':
      return <ImageIcon {...iconProps} className="text-yellow-600" />;

    // Audio
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
    case 'm4a':
    case 'aac':
      return <Music {...iconProps} className="text-green-400" />;

    // Video
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'webm':
    case 'mkv':
    case 'flv':
      return <Video {...iconProps} className="text-red-400" />;

    // Archives
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
      return <Archive {...iconProps} className="text-yellow-500" />;

    // Text
    case 'txt':
    case 'log':
    case 'rtf':
      return <FileText {...iconProps} className="text-gray-400" />;

    default:
      return <File {...iconProps} className="text-gray-400" />;
  }
};

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
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const contentRef = useRef<HTMLDivElement>(null);
  const isFolder = content instanceof Map;

  const toggleExpanded = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    }
  };

  const getFolderIcon = () => {
    if (!isFolder) return null;
    if (!customizationOptions.useIcons) return null;
    
    const iconProps = { size: 16 };
    
    if (isExpanded) {
      return <FolderOpen {...iconProps} className="text-blue-400" />;
    } else {
      return <Folder {...iconProps} className="text-blue-400" />;
    }
  };

  const getExpandIcon = () => {
    if (!isFolder) return <div className="w-4 h-4" />; // Spacer for alignment
    
    const iconProps = { size: 12 };
    
    return isExpanded ? 
      <ChevronDown {...iconProps} className="text-gray-400 transition-transform duration-200" /> :
      <ChevronRight {...iconProps} className="text-gray-400 transition-transform duration-200" />;
  };

  const getIndentationClass = () => {
    return `tree-node-depth-${depth}`;
  };

  if (isFolder) {
    return (
      <div className="select-none">
        <div 
          className={`tree-node ${getIndentationClass()}`}
          onClick={toggleExpanded}
          style={{ cursor: 'pointer' }}
        >
          <span className="tree-expand-icon">
            {getExpandIcon()}
          </span>
          <span className="tree-node-icon">
            {getFolderIcon()}
          </span>
          <span className="tree-node-name" title={name}>
            {name}
          </span>
        </div>
        
        <div 
          className="tree-children"
          style={{ 
            height: isExpanded ? 'auto' : '0px',
            overflow: 'hidden',
            transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {isExpanded && (
            <div ref={contentRef}>
              {Array.from(content.entries())
                .sort(([a, childrenA], [b, childrenB]) => {
                  const aIsFolder = childrenA instanceof Map;
                  const bIsFolder = childrenB instanceof Map;
                  if (aIsFolder && !bIsFolder) return -1;
                  if (!aIsFolder && bIsFolder) return 1;
                  return a.localeCompare(b);
                })
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
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={`tree-node tree-node-file ${getIndentationClass()}`}>
        <span className="tree-expand-icon">
          <div className="w-4 h-4" /> {/* Spacer for alignment */}
        </span>
        <span className="tree-node-icon">
          {customizationOptions.useIcons ? getFileIcon(name) : null}
        </span>
        <span className="tree-node-name" title={name}>
          {name}
        </span>
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
  if (!structure || structure.size === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No files to display
      </div>
    );
  }

  return (
    <div className="tree-container">
      {Array.from(structure.entries())
        .sort(([a, childrenA], [b, childrenB]) => {
          const aIsFolder = childrenA instanceof Map;
          const bIsFolder = childrenB instanceof Map;
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return a.localeCompare(b);
        })
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
