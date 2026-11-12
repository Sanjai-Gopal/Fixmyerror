import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { DiffViewer } from './DiffViewer';
import {
  Lightbulb,
  CheckCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code,
  Bot,
  MessageSquare,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  onCopyFix: (code: string) => void;
  isCopied: boolean;
  onStartOver: () => void;
  onOpenChat: () => void;
  onApplyFixToEditor?: (fixedCode: string) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onCopyFix,
  isCopied,
  onStartOver,
  onOpenChat,
  onApplyFixToEditor,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [isFixApplied, setIsFixApplied] = useState(false);

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyFix = () => {
    if (onApplyFixToEditor && analysis.codeAfter) {
      onApplyFixToEditor(analysis.codeAfter);
      setIsFixApplied(true);
      setTimeout(() => setIsFixApplied(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 sm:p-7 space-y-7 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900/60">
              <Bot className="w-3.5 h-3.5" />
              <span>Autonomous Agent Diagnosis</span>
            </span>
            {analysis.errorCategory && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · {analysis.errorCategory}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {analysis.errorName}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Copilot</span>
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Agent Thought & Execution Trace */}
      {analysis.agentTrace && analysis.agentTrace.length > 0 && (
        <section className="space-y-3 bg-slate-900 dark:bg-slate-950 rounded-xl p-4 sm:p-5 text-slate-100 border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Agent Reasoning & Execution Trace
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All invariants passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {analysis.agentTrace.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/70 dark:bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-blue-400 mb-1">
                    <span className="font-mono">{idx + 1}. {step.stage}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {step.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.thought}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 1: Likely Cause */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/60">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Likely Cause
          </h3>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-4 text-slate-800 dark:text-amber-200 text-xs sm:text-sm leading-relaxed">
          <p>{analysis.likelyCause}</p>
        </div>
      </section>

      {/* Section 2: Relevant Line / Snippet */}
      {analysis.relevantSnippet && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Faulty Dereference Location
              </h3>
            </div>
            {analysis.relevantLineNumber && (
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Line {analysis.relevantLineNumber}
              </span>
            )}
          </div>
          <div className="bg-slate-900 dark:bg-slate-950 text-rose-300 border border-slate-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm overflow-x-auto code-scroll">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 select-none font-bold">▶</span>
              <code>{analysis.relevantSnippet}</code>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Suggested Fix Before/After Diff */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Suggested Patch (Before / After Diff)
          </h3>
          {onApplyFixToEditor && (
            <button
              type="button"
              onClick={handleApplyFix}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                isFixApplied
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isFixApplied ? 'Applied to Editor!' : 'Apply Patch to Editor'}</span>
            </button>
          )}
        </div>
        <DiffViewer
          codeBefore={analysis.codeBefore}
          codeAfter={analysis.codeAfter}
          fixSnippetOnly={analysis.fixSnippetOnly}
          onCopyFix={onCopyFix}
          isCopied={isCopied}
        />
      </section>

      {/* Section 4: Why this works */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Why This Works (Mental Model)
          </h3>
        </div>
        <div className="bg-slate-50 dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-2">
          <p>{analysis.whyThisWorks}</p>
        </div>
      </section>

      {/* Section 5: Edge cases to watch */}
      {analysis.edgeCasesToWatch && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Edge Cases & Gotchas to Watch
            </h3>
          </div>
          <div className="bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl p-4 text-slate-700 dark:text-indigo-200 text-xs sm:text-sm leading-relaxed">
            <p>{analysis.edgeCasesToWatch}</p>
          </div>
        </section>
      )}

      {/* Section 6: Try this verification steps */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          “Try this” Verification Checklist
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Execute these test checks in your console to verify that the bug is definitively resolved:
        </p>
        <div className="space-y-2.5">
          {analysis.verificationSteps.map((step, idx) => {
            const isDone = !!checkedSteps[step.id];
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                    : 'bg-white dark:bg-[#161F30] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="text-xs sm:text-sm font-medium">
                    <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-mono">
                      {idx + 1}.
                    </span>
                    <span className={isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}>
                      {step.instruction}
                    </span>
                  </div>
                  {step.codeHint && (
                    <pre className="mt-1 font-mono text-xs p-2 bg-slate-900 dark:bg-slate-950 text-emerald-300 rounded-lg overflow-x-auto whitespace-pre code-scroll">
                      {step.codeHint}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 7: Documentation Reference area */}
      <section className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Official Documentation References
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            MDN & React Docs Reference
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.docSources.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161F30] hover:bg-white dark:hover:bg-[#1c273c] hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    {doc.source}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {doc.summary}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {doc.urlLabel}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Actions Bar */}
      <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenChat}
          className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
        >
          <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Ask follow-up to AI Agent Copilot</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onStartOver}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onCopyFix(analysis.fixSnippetOnly)}
            className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {isCopied ? 'Fix Copied!' : 'Copy Fix'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
