'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthStatus from '@/components/generator/auth-status';
import RepoBrowser from '@/components/generator/repo-browser';
import ValidationDialog from '@/components/generator/validation-dialog';
import OutputViewer from '@/components/generator/output-viewer';
import RepoMetaFooter from '@/components/generator/repo-meta-footer';
import StarNote from '@/components/generator/star-note';
import { useRepoTreeGeneratorState, type ProviderType } from '@/hooks/use-repo-tree-generator-state';
import {
  ChevronDown,
  CircleX,
  Github,
  List,
  RefreshCw,
} from 'lucide-react';

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

export default function RepoTreeGenerator() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.accessToken;

  const state = useRepoTreeGeneratorState(isAuthenticated);

  const {
    sourceTab,
    setSourceTab,
    repoUrl,
    repoType,
    setRepoType,
    loading,
    validation,
    setValidation,
    repoValidation,
    showValidationDialog,
    setShowValidationDialog,
    hasOutput,
    showInputErrorBorder,
    showStarNote,
    showDownloadMenu,
    setShowDownloadMenu,
    inputRef,
    outputRef,
    isEmpty,
    viewMode,
    searchTerm,
    setSearchTerm,
    treeString,
    filteredMap,
    customizationOptions,
    handleCustomizationChange,
    fileTypeData,
    languageData,
    selectedRepoName,
    copied,
    copyToClipboard,
    handleDownload,
    expanded,
    setExpanded,
    handleUrlChange,
    handleFetchStructure,
    handleRepoSelect,
    handleClearInput,
    validateUrl,
  } = state;

  const handleValidationContinue = () => {
    setShowValidationDialog(false);
    handleFetchStructure(repoUrl, true);
  };

  return (
    <>
      <ValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        repoValidation={repoValidation}
        onContinue={handleValidationContinue}
        onCancel={() => setShowValidationDialog(false)}
      />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Repo<span className="text-blue-600">Tree</span> Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Generate clean ASCII trees from any GitHub or GitLab repository.
            Perfect for documentation, READMEs, and code reviews.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 pt-5">
            <AuthStatus />
          </div>

          <div className="px-5 sm:px-6 pt-5 pb-0">
            {isAuthenticated && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-5">
                <button
                  onClick={() => setSourceTab('my-repos')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    sourceTab === 'my-repos'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List size={14} />
                  My Repositories
                </button>
                <button
                  onClick={() => setSourceTab('url')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    sourceTab === 'url'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Paste URL
                </button>
              </div>
            )}

            {sourceTab === 'my-repos' && isAuthenticated && (
              <div className="pb-5">
                <RepoBrowser onSelect={handleRepoSelect} />
              </div>
            )}

            {sourceTab === 'url' && (
              <div className="pb-5 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-32 flex-shrink-0">
                    <select
                      value={repoType}
                      onChange={(e) => {
                        const next = e.target.value as ProviderType;
                        setRepoType(next);
                        if (repoUrl.trim()) setValidation(validateUrl(repoUrl));
                      }}
                      className="w-full h-11 pl-3 pr-8 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                    >
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <ChevronDown size={13} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <Input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      value={repoUrl}
                      onChange={handleUrlChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) handleFetchStructure();
                      }}
                      placeholder={
                        repoType === 'github'
                          ? 'https://github.com/username/repo'
                          : 'https://gitlab.com/username/repo'
                      }
                      className={`h-11 pl-3.5 pr-10 text-sm rounded-xl transition-colors ${
                        showInputErrorBorder
                          ? 'border-red-300 dark:border-red-700 focus-visible:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus-visible:ring-blue-300'
                      }`}
                    />
                    {repoUrl && (
                      <button
                        onClick={handleClearInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Clear"
                      >
                        <CircleX size={16} />
                      </button>
                    )}
                  </div>

                  <Button
                    onClick={() => handleFetchStructure()}
                    disabled={loading || (validation.isError && !!repoUrl.trim())}
                    className="h-11 px-6 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-shrink-0 w-full sm:w-auto"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin mr-2" />
                    ) : repoType === 'github' ? (
                      <Github size={14} className="mr-2" />
                    ) : (
                      <GitLabIcon className="h-3.5 w-3.5 mr-2" />
                    )}
                    {loading ? 'Generating…' : 'Generate'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {hasOutput && (
            <OutputViewer
              viewMode={viewMode}
              setViewMode={state.setViewMode}
              isEmpty={isEmpty}
              expanded={expanded}
              setExpanded={setExpanded}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              treeString={treeString}
              filteredMap={filteredMap}
              customizationOptions={customizationOptions}
              onCustomizationChange={handleCustomizationChange}
              loading={loading}
              validationError={validation.isError ? validation.message : null}
              repoType={repoType}
              repoName={selectedRepoName}
              copied={copied}
              onCopy={copyToClipboard}
              onDownload={handleDownload}
              showDownloadMenu={showDownloadMenu}
              setShowDownloadMenu={setShowDownloadMenu}
              fileTypeData={fileTypeData}
              languageData={languageData}
              outputRef={outputRef}
            />
          )}

          <RepoMetaFooter repoValidation={repoValidation} isEmpty={isEmpty} />

          <StarNote show={showStarNote} />
        </div>
      </div>

      {showDownloadMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
      )}
    </>
  );
}
