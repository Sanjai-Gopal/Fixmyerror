import React, { useRef, useEffect } from 'react';
import { FrameworkLanguage } from '../types';
import { FileCode, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: FrameworkLanguage;
  onResetToSample?: () => void;
  highlightLine?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onResetToSample,
  highlightLine,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  const getFilename = () => {
    switch (language) {
      case 'javascript':
        return 'script.js';
      case 'react':
        return 'Component.jsx';
      case 'css':
        return 'styles.css';
      default:
        return 'code.txt';
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111827] overflow-hidden shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
      {/* Editor top toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 dark:bg-[#161F30] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
            {getFilename()}
          </span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetToSample && (
            <button
              type="button"
              onClick={onResetToSample}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset code to sample bug"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor body with line number gutter and textarea */}
      <div className="relative flex bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm min-h-[220px] max-h-[360px]">
        {/* Line numbers gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none py-3.5 px-3 bg-slate-950 text-slate-500 border-r border-slate-800 text-right font-mono text-xs overflow-hidden w-12 shrink-0 leading-6"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`transition-colors ${
                  isHighlighted
                    ? 'text-amber-400 font-bold bg-amber-500/20 rounded-xs'
                    : 'text-slate-500'
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          aria-label="Code editor"
          spellCheck={false}
          className="w-full h-[240px] sm:h-[260px] p-3.5 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm resize-none focus:outline-hidden leading-6 whitespace-pre overflow-auto code-scroll selection:bg-blue-600 selection:text-white"
          placeholder={`// Paste your ${language} code snippet here...\nfunction example() {\n  // Code\n}`}
        />
      </div>
    </div>
  );
};
