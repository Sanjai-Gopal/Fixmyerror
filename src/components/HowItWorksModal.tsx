import React from 'react';
import { X, Code2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSample: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onLoadSample,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
              How FixMyError Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Designed specifically for beginner web developers learning to debug.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 py-6">
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 font-semibold text-sm">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Paste your code</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Add the function, component, or CSS block that is behaving unexpectedly. The editor includes line numbers so you can cross-reference file lines.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900 font-semibold text-sm">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Paste the error message</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Copy the red message from your browser console (<kbd className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300">F12</kbd>) or terminal output.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900 font-semibold text-sm">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Get an accessible explanation & fix</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                FixMyError breaks down what went wrong in plain terms, shows the exact diff to fix it, explains the underlying mental model, and gives you verification steps.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            No code is sent to an external server or changed automatically.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onLoadSample();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Load sample bug
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
