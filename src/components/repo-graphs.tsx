'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from 'recharts';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface FileTypeData {
  name: string;
  value: number;
}

interface LanguageData {
  name: string;
  percentage: number;
}

interface Props {
  fileTypeData: FileTypeData[];
  languageData: LanguageData[];
}

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

interface OutsideLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  percent?: number;
}

const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-blue-600">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
        <p className="text-xs text-blue-600">{payload[0].value} files</p>
      </div>
    );
  }
  return null;
};

export const RepoGraphs: React.FC<Props> = ({ fileTypeData, languageData }) => {
  const handleExport = async (sectionId: string, fileName: string) => {
    try {
      const el = document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement;
      if (!el) return;

      const btns = el.querySelectorAll('button');
      btns.forEach((b) => ((b as HTMLElement).style.visibility = 'hidden'));

      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      btns.forEach((b) => ((b as HTMLElement).style.visibility = ''));

      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, fileName);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  const totalFiles = fileTypeData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  }: PieLabelProps) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderOutsideLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    name = '',
    percent = 0,
  }: OutsideLabelProps) => {
    if (percent < 0.03) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 28;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[11px] font-medium fill-gray-700 dark:fill-gray-300"
      >
        {name}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Repository Analysis
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Visual breakdown of file types and programming languages in your repository.
        </p>
      </div>

      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative bg-white dark:bg-gray-900"
        data-section="languages"
      >
        <button
          onClick={() => handleExport('languages', 'programming-languages.png')}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download Programming Languages Chart"
          aria-label="Download Programming Languages Chart"
        >
          <Download size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Programming Languages
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Distribution of languages used in the repository
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={languageData} margin={{ top: 10, right: 16, left: 0, bottom: 60 }}>
            <XAxis
              dataKey="name"
              angle={-40}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} width={40} />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="percentage" radius={[3, 3, 0, 0]} fill="#3b82f6">
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={(v: number) => `${v.toFixed(1)}%`}
                style={{ fontSize: 10, fill: '#6b7280' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative bg-white dark:bg-gray-900"
        data-section="file-types"
      >
        <button
          onClick={() => handleExport('file-types', 'file-type-distribution.png')}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download File Type Distribution Chart"
          aria-label="Download File Type Distribution Chart"
        >
          <Download size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
            File Type Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Breakdown of different file types in the repository
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1 w-full lg:w-auto lg:flex-shrink-0 text-gray-700 dark:text-gray-300">
            <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={130}
                  innerRadius={55}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {fileTypeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>

                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: OutsideLabelProps) =>
                    renderOutsideLabel({
                      ...props,
                      name: props?.name,
                    })
                  }
                  outerRadius={130}
                  innerRadius={55}
                  fill="transparent"
                  dataKey="value"
                  stroke="none"
                />

                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-shrink-0 lg:min-w-[280px] lg:max-w-[320px] w-full">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">File Types</h4>
            <div
              className="max-h-[320px] overflow-y-auto overflow-x-auto pr-2 pb-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF transparent',
              }}
            >
              <div
                className={`grid gap-x-4 gap-y-2 ${
                  fileTypeData.length > 8 ? 'grid-cols-2' : 'grid-cols-1'
                } min-w-max`}
                style={{
                  gridTemplateColumns: fileTypeData.length > 8 ? '1fr 1fr' : '1fr',
                }}
              >
                {fileTypeData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 min-w-0 w-full whitespace-nowrap"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1"
                      title={entry.name}
                    >
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 ml-2">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative bg-white dark:bg-gray-900"
        data-section="summary"
      >
        <button
          onClick={() => handleExport('summary', 'repository-summary.png')}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download Repository Summary"
          aria-label="Download Repository Summary"
        >
          <Download size={16} />
        </button>

        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Repository Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Languages', value: languageData.length, color: 'text-blue-600' },
            { label: 'Total Files', value: totalFiles.toLocaleString(), color: 'text-green-600' },
            { label: 'Primary Language', value: languageData[0]?.name ?? '—', color: 'text-purple-600' },
            {
              label: 'Dominance',
              value: `${languageData[0]?.percentage?.toFixed(1) ?? '0.0'}%`,
              color: 'text-orange-600',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-xl md:text-2xl font-semibold ${color}`}>{value}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
