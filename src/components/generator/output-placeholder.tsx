import { X } from 'lucide-react';

interface OutputPlaceholderProps {
  loading: boolean;
  error: string | null;
  provider: string;
  repoName: string | null;
}

export default function OutputPlaceholder({
  loading,
  error,
  provider,
  repoName,
}: OutputPlaceholderProps) {
  if (loading) {
    return (
      <div className="bg-[#1d1f21] min-h-[220px] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-mono">
          {repoName ? `Fetching ${repoName}…` : 'Fetching repository structure…'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1d1f21] min-h-[220px] flex items-center justify-center p-6">
        <div className="flex items-center gap-2.5 text-red-400">
          <X size={18} className="flex-shrink-0 opacity-60" />
          <p className="text-sm font-mono leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1d1f21] min-h-[220px] flex flex-col items-center justify-center gap-2 px-6">
      <p className="text-sm text-gray-500 font-mono text-center">
        Enter a {provider === 'github' ? 'GitHub' : 'GitLab'} repository URL and click Generate
      </p>
      <p className="text-xs text-gray-600 font-mono text-center">
        or browse your repositories above
      </p>
    </div>
  );
}
