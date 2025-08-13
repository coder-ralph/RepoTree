import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
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

interface RepoGraphsProps {
  fileTypeData: FileTypeData[];
  languageData: LanguageData[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
  label?: string;
}

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

interface OutsideLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export const RepoGraphs: React.FC<RepoGraphsProps> = ({ fileTypeData, languageData }) => {
  // PNG export functionality for individual sections
  const handleExportPNG = async (sectionId: string, fileName: string) => {
    try {
      const element = document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement;
      
      if (!element) {
        console.error(`Element with data-section="${sectionId}" not found`);
        return;
      }

      // Hide download buttons during capture
      const downloadButtons = element.querySelectorAll('button');
      downloadButtons.forEach(btn => btn.style.visibility = 'hidden');

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: false,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Show download buttons again
      downloadButtons.forEach(btn => btn.style.visibility = 'visible');

      // Convert canvas to blob and save using file-saver
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, fileName);
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting image. Please try again.');
    }
  };

  // Custom tooltip for the bar chart
  const CustomBarTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-50">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">
            Usage: <span className="font-bold">{payload[0].value.toFixed(2)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-50">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600">
            Files: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart (inside)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
    if (percent < 0.05) return null; // Hide labels for slices smaller than 5%
    
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

  // Custom outside label for pie chart (name)
  const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, name, percent }: OutsideLabelProps) => {
    if (percent < 0.03) return null; // Hide labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30; // Position outside the pie
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name}
      </text>
    );
  };

  return (
    <div className="space-y-8 relative" data-export-container>
      {/* Programming Languages Usage Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative" data-section="languages">
        <button
          onClick={() => handleExportPNG('languages', 'programming-languages.png')}
          aria-label="Download Programming Languages Chart"
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Download Programming Languages Chart"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Programming Languages</h3>
          <p className="text-gray-600">Distribution of languages used in the repository</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={languageData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              className="text-sm font-medium"
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              className="text-sm"
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar 
              dataKey="percentage" 
              radius={[4, 4, 0, 0]}
              fill="url(#languageGradient)"
            >
              <LabelList 
                dataKey="percentage" 
                position="top" 
                formatter={(value: number) => `${value.toFixed(1)}%`}
                className="text-xs font-semibold fill-gray-700"
              />
            </Bar>
            <defs>
              <linearGradient id="languageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* File Types Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative" data-section="file-types">
        <button
          onClick={() => handleExportPNG('file-types', 'file-type-distribution.png')}
          aria-label="Download File Type Distribution Chart"
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Download File Type Distribution Chart"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">File Type Distribution</h3>
          <p className="text-gray-600">Breakdown of different file types in the repository</p>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1 w-full lg:w-auto lg:flex-shrink-0">
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={140}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="white"
                  strokeWidth={2}
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]} 
                    />
                  ))}
                </Pie>
                {/* Outside labels for file names */}
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderOutsideLabel({...props, name: props.name})}
                  outerRadius={140}
                  innerRadius={50}
                  fill="transparent"
                  dataKey="value"
                  stroke="none"
                />
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend with scrollbar */}
          <div className="flex-shrink-0 lg:min-w-[320px] lg:max-w-[320px]">
            <h4 className="font-semibold text-gray-800 mb-4">File Types</h4>
            <div 
              className="max-h-[500px] overflow-y-auto overflow-x-auto pr-2 pb-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF transparent', // Gray thumb, transparent track for Firefox
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                
                div::-webkit-scrollbar-thumb {
                  background-color: #9CA3AF;
                  border-radius: 3px;
                  border: none;
                }
                
                div::-webkit-scrollbar-thumb:hover {
                  background-color: #6B7280;
                }
                
                div::-webkit-scrollbar-corner {
                  background: transparent;
                }
              `}</style>
              <div className={`grid gap-x-4 gap-y-2 ${fileTypeData.length > 8 ? 'grid-cols-2' : 'grid-cols-1'} min-w-max`} style={{ gridTemplateColumns: fileTypeData.length > 8 ? '1fr 1fr' : '1fr' }}>
                {fileTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 min-w-0 w-full whitespace-nowrap">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700 flex-1" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-gray-800 flex-shrink-0 ml-2">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 relative" data-section="summary">
        <button
          onClick={() => handleExportPNG('summary', 'repository-summary.png')}
          aria-label="Download Repository Summary"
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Download Repository Summary"
        >
          <Download className="w-4 h-4" />
        </button>
        <h4 className="text-lg font-bold text-gray-800 mb-4">Repository Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {languageData.length}
            </div>
            <div className="text-sm text-gray-600">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {fileTypeData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {languageData[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Primary Language</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {languageData[0]?.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Dominance</div>
          </div>
        </div>
      </div>
    </div>
  );
};
