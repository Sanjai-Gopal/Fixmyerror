import React, { useState } from 'react';
import { Copy, Check, Columns, AlignJustify } from 'lucide-react';

interface DiffViewerProps {
  codeBefore: string;
  codeAfter: string;
  fixSnippetOnly: string;
  onCopyFix: (snippet: string) => void;
  isCopied: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  codeBefore,
  codeAfter,
  fixSnippetOnly,
  onCopyFix,
  isCopied,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const beforeLines = codeBefore.trim().split('\n');
  const afterLines = codeAfter.trim().split('\n');

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-900 text-slate-100 overflow-hidden shadow-xs">
      {/* Diff header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suggested Fix Diff
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/80 inline-block"></span>
            <span>Remove broken line</span>
            <span className="text-slate-600">·</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/80 inline-block"></span>
            <span>Add safe fallback</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-slate-700 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Side-by-side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-slate-700 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stacked</span>
            </button>
          </div>

          {/* Copy fix button */}
          <button
            type="button"
            onClick={() => onCopyFix(fixSnippetOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff body */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs sm:text-sm font-mono">
          {/* Before column */}
          <div className="p-4 bg-slate-900/90 overflow-x-auto code-scroll">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-rose-400">
              <span>BEFORE (Cause of error)</span>
              <span className="text-slate-500">Original</span>
            </div>
            <div className="space-y-1">
              {beforeLines.map((line, idx) => {
                const isErrorLine =
                  line.includes('const items = user.tags;') ||
                  line.includes('<p>{profile.bio.summary}</p>') ||
                  line.includes('z-index: 9999;') ||
                  line.includes('.map(');
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 py-0.5 px-1.5 rounded-xs transition-colors ${
                      isErrorLine
                        ? 'bg-rose-950/60 text-rose-200 border-l-2 border-rose-500'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="select-none text-slate-600 w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className="select-none text-rose-400 font-bold w-3 shrink-0">
                      {isErrorLine ? '−' : ' '}
                    </span>
                    <pre className="font-mono whitespace-pre">{line}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* After column */}
          <div className="p-4 bg-slate-950/40 overflow-x-auto code-scroll">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-emerald-400">
              <span>AFTER (Minimal safe fix)</span>
              <span className="text-slate-500">Fixed</span>
            </div>
            <div className="space-y-1">
              {afterLines.map((line, idx) => {
                const isFixedLine =
                  line.includes('user.tags || []') ||
                  line.includes('profile?.bio?.summary') ||
                  line.includes('position: fixed;') ||
                  line.includes('inset: 0;') ||
                  line.includes('// Default');
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 py-0.5 px-1.5 rounded-xs transition-colors ${
                      isFixedLine
                        ? 'bg-emerald-950/60 text-emerald-200 border-l-2 border-emerald-500'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="select-none text-slate-600 w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className="select-none text-emerald-400 font-bold w-3 shrink-0">
                      {isFixedLine ? '+' : ' '}
                    </span>
                    <pre className="font-mono whitespace-pre">{line}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Stacked unified diff view */
        <div className="p-4 space-y-4 font-mono text-xs sm:text-sm">
          <div>
            <div className="text-xs font-semibold text-rose-400 pb-1 mb-2 border-b border-slate-800">
              Original code (before):
            </div>
            <pre className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg text-rose-200 overflow-x-auto whitespace-pre code-scroll">
              {codeBefore}
            </pre>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 pb-1 mb-2 border-b border-slate-800">
              Suggested code (after):
            </div>
            <pre className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-lg text-emerald-200 overflow-x-auto whitespace-pre code-scroll">
              {codeAfter}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
