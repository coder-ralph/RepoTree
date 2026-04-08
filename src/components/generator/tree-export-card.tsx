'use client';

import React, { useMemo } from 'react';

interface TreeExportCardProps {
  treeString: string;
  repoName: string | null;
  repoUrl?: string;
  showWatermark?: boolean;
}

interface GradientStop {
  offset: string;
  color: string;
}

const GRADIENT_STOPS: GradientStop[] = [
  { offset: '0%', color: '#667eea' },
  { offset: '50%', color: '#764ba2' },
  { offset: '100%', color: '#f093fb' },
];

const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace';

export const TreeExportCard: React.FC<TreeExportCardProps> = ({
  treeString,
  repoName,
  repoUrl,
  showWatermark = false,
}) => {
  const lines = useMemo(() => treeString.split('\n'), [treeString]);

  const extractOwnerAndRepo = (url: string): { owner: string | null; repo: string | null } => {
    try {
      const match = url.match(/\/(?:github|gitlab)\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
      }
    } catch {
      // ignore
    }
    return { owner: null, repo: null };
  };

  const { owner, repo } = useMemo(() => extractOwnerAndRepo(repoUrl || ''), [repoUrl]);
  const headerTitle = useMemo(() => {
    return owner && repo ? `${owner}/${repo}` : (repoName || repo || 'Repository');
  }, [owner, repo, repoName]);

  const { svgWidth, svgHeight, lineHeight, fontSize, padding, titleBarPadding, footerY } = useMemo(() => {
    const fontSize = 13;
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.6;
    const padding = { top: 24, right: 32, bottom: 24, left: 32 };
    const headerHeight = 48;
    const footerHeight = showWatermark ? 32 : 0;

    const maxLen = Math.max(...lines.map(l => l.length), 0);
    const contentWidth = maxLen * charWidth;
    const contentHeight = lines.length * lineHeight;

    const titleBarPadding = 20;
    const cardWidth = Math.max(600, contentWidth + padding.left + padding.right + titleBarPadding * 2);
    const cardHeight = headerHeight + contentHeight + padding.top + padding.bottom + footerHeight;

    return {
      svgWidth: Math.ceil(cardWidth),
      svgHeight: Math.ceil(cardHeight),
      lineHeight,
      fontSize,
      padding,
      titleBarPadding,
      footerHeight,
      footerY: padding.top + headerHeight + contentHeight + padding.bottom,
    };
  }, [lines, showWatermark]);

  const gradientId = 'treeExportGradient';
  const shadowId = 'treeExportShadow';

  const headerCenterY = padding.top + 24;
  const dotRadius = 5;
  const dotSpacing = 14;
  const dotStartX = 20 + 16;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ fontFamily: FONT_FAMILY }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {GRADIENT_STOPS.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      <rect
        x="0"
        y="0"
        width={svgWidth}
        height={svgHeight}
        fill={`url(#${gradientId})`}
      />

      <rect
        x="20"
        y="20"
        width={svgWidth - 40}
        height={svgHeight - 40}
        rx="16"
        ry="16"
        fill="#0d1117"
        filter={`url(#${shadowId})`}
      />

      <rect
        x="20"
        y="20"
        width={svgWidth - 40}
        height="48"
        rx="16"
        ry="16"
        fill="#161b22"
      />
      <rect
        x="20"
        y="52"
        width={svgWidth - 40}
        height="16"
        fill="#161b22"
      />

      <circle cx={dotStartX} cy={headerCenterY} r={dotRadius} fill="#ff5f57" />
      <circle cx={dotStartX + dotSpacing} cy={headerCenterY} r={dotRadius} fill="#febc2e" />
      <circle cx={dotStartX + dotSpacing * 2} cy={headerCenterY} r={dotRadius} fill="#28c840" />

      <text
        x={svgWidth / 2}
        y={headerCenterY + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e6edf3"
        fontSize={fontSize}
        fontWeight="500"
      >
        {headerTitle}
      </text>

      <text
        x={padding.left + titleBarPadding}
        y={padding.top + 48 + (lineHeight * 0.75)}
        fill="#8b949e"
        fontSize={fontSize}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={padding.left + titleBarPadding} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>

      {showWatermark && (
        <text
          x={svgWidth / 2}
          y={footerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity="0.4"
          fontSize={10}
          fontWeight="400"
        >
          Generated by RepoTree
        </text>
      )}
    </svg>
  );
};

export default TreeExportCard;
