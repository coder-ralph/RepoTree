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
    setAllowLargeRepo,
    hasOutput,
    showInputErrorBorder,
    showStarNote,
    showDownloadMenu,
    setShowDownloadMenu,
    showExportImageMenu,
    setShowExportImageMenu,
    isLargeExport,
    inputRef,
    outputRef,
    isEmpty,
    viewMode,
    entryCounts,
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
    handleExportImage,
    expanded,
    setExpanded,
    handleUrlChange,
    handleFetchStructure,
    handleValidateAndGenerate,
    handleRepoSelect,
    handleClearInput,
    validateUrl,
    maxDepth,
    setMaxDepth,
    excludePatternsInput,
    setExcludePatternsInput,
    excludePatterns,
  } = state;

  const handleValidationContinue = () => {
    setAllowLargeRepo(true);
    setShowValidationDialog(false);
    handleValidateAndGenerate();
  };

  return (
    <>
      <ValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        repoValidation={repoValidation}
        onContinue={handleValidationContinue}
        onCancel={() => setShowValidationDialog(false)}
        maxDepth={maxDepth}
        excludePatterns={excludePatterns}
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
                    <label htmlFor="repoType" className="sr-only">
                      Repository provider
                    </label>
                    <select
                      id="repoType"
                      value={repoType}
                      onChange={(e) => {
                        const next = e.target.value as ProviderType;
                        setRepoType(next);
                        if (repoUrl.trim()) setValidation(validateUrl(repoUrl, next));
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

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="maxDepth" className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Max Depth
                    </label>
                    <select
                      id="maxDepth"
                      value={maxDepth ?? ''}
                      onChange={(e) => setMaxDepth(e.target.value ? parseInt(e.target.value, 10) : null)}
                      className="h-9 px-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Unlimited</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <label htmlFor="excludeItems" className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Exclude
                    </label>
                    <input
                      id="excludeItems"
                      type="text"
                      value={excludePatternsInput}
                      onChange={(e) => setExcludePatternsInput(e.target.value)}
                      placeholder="node_modules, dist, *.log"
                      className="flex-1 h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                    />
                    {excludePatterns.length > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {excludePatterns.length} pattern{excludePatterns.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
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
              structureMap={state.structureMap}
              filteredMap={filteredMap}
              customizationOptions={customizationOptions}
              onCustomizationChange={handleCustomizationChange}
              loading={loading}
              validationError={validation.isError ? validation.message : null}
              repoType={repoType}
              repoName={selectedRepoName}
              repoUrl={repoUrl}
              copied={copied}
              onCopy={copyToClipboard}
              onDownload={handleDownload}
              showDownloadMenu={showDownloadMenu}
              setShowDownloadMenu={setShowDownloadMenu}
              onExportImage={handleExportImage}
              showExportImageMenu={showExportImageMenu}
              setShowExportImageMenu={setShowExportImageMenu}
              isLargeExport={isLargeExport}
              fileTypeData={fileTypeData}
              languageData={languageData}
              outputRef={outputRef}
            />
          )}

          <RepoMetaFooter 
            repoValidation={repoValidation} 
            isEmpty={isEmpty} 
            entryCounts={entryCounts} 
            maxDepth={maxDepth}
            excludePatterns={excludePatterns}
          />

          <StarNote show={showStarNote} />
        </div>
      </div>

      {showDownloadMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
      )}

      {showExportImageMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowExportImageMenu(false)} />
      )}
    </>
  );
}
