import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const ErrorInput: React.FC<ErrorInputProps> = ({
  value,
  onChange,
  onClear,
}) => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] overflow-hidden shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 dark:focus-within:ring-amber-900/40 transition-all">
      {/* Error top toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-rose-50/60 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
            Console or Terminal Error
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-medium flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="Clear error message"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="p-3 bg-white dark:bg-[#111827]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Error message or stack trace"
          rows={4}
          spellCheck={false}
          className="w-full font-mono text-xs sm:text-sm text-rose-950 dark:text-rose-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent resize-none focus:outline-hidden leading-relaxed code-scroll"
          placeholder="TypeError: Cannot read properties of undefined (reading 'map')&#10;    at renderUserTags (profile.js:6:16)&#10;    at Object.<anonymous> (profile.js:13:14)"
        />
      </div>
    </div>
  );
};
