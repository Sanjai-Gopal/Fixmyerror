import React, { useState } from 'react';
import { FrameworkLanguage } from '../types';
import { CodeEditor } from './CodeEditor';
import { ErrorInput } from './ErrorInput';
import { LanguageSelector } from './LanguageSelector';
import {
  Send,
  Code2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  FileCode,
} from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (text: string, attachedCode?: string, attachedError?: string, lang?: FrameworkLanguage) => void;
  isLoading: boolean;
  language: FrameworkLanguage;
  onLanguageChange: (lang: FrameworkLanguage) => void;
  code: string;
  setCode: (code: string) => void;
  errorText: string;
  setErrorText: (err: string) => void;
  onLoadPreset: (lang: FrameworkLanguage) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading,
  language,
  onLanguageChange,
  code,
  setCode,
  errorText,
  setErrorText,
  onLoadPreset,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  const hasCodeOrError = Boolean(code.trim() || errorText.trim());

  const handleSend = () => {
    if (isLoading) return;
    const trimmedInput = inputText.trim();
    if (!trimmedInput && !hasCodeOrError) return;

    // Send the message
    onSendMessage(
      trimmedInput || (hasCodeOrError ? `Please debug this ${language} error.` : ''),
      code.trim() ? code : undefined,
      errorText.trim() ? errorText : undefined,
      language
    );

    // Clear main input after send
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-30 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        {/* Quick Sample Presets bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Sample bugs:</span>
            <button
              type="button"
              onClick={() => {
                onLoadPreset('javascript');
                setIsEditorExpanded(true);
              }}
              className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
            >
              items.map (JS)
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadPreset('react');
                setIsEditorExpanded(true);
              }}
              className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
            >
              Props undefined (React)
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadPreset('css');
                setIsEditorExpanded(true);
              }}
              className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
            >
              z-index (CSS)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditorExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{isEditorExpanded ? 'Hide Code & Error' : 'Attach Code & Error'}</span>
            {hasCodeOrError && (
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 inline-block" />
            )}
            {isEditorExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Expandable Code Snippet & Error Area */}
        {isEditorExpanded && (
          <div className="p-4 bg-slate-50 dark:bg-[#0E1524] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <LanguageSelector selected={language} onChange={onLanguageChange} />
              <div className="flex items-center gap-2">
                {hasCodeOrError && (
                  <button
                    type="button"
                    onClick={() => {
                      setCode('');
                      setErrorText('');
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear attachments</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditorExpanded(false)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Code Snippet:</span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {code.split('\n').length} lines
                </span>
              </div>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                onResetToSample={() => onLoadPreset(language)}
              />
            </div>

            {/* Error Input */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Console / Terminal Error Message:
              </span>
              <ErrorInput
                value={errorText}
                onChange={setErrorText}
                onClear={() => setErrorText('')}
              />
            </div>
          </div>
        )}

        {/* Input Bar Form */}
        <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-[#161F30] rounded-2xl p-2 border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-[#1a253a] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasCodeOrError
                ? `Ask FixMyError Agent about this ${language} code... (Press Ctrl + Enter to send)`
                : "Ask FixMyError Agent a question or paste code/error... (Press Ctrl + Enter to send)"
            }
            rows={2}
            className="flex-1 bg-transparent resize-none p-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden leading-relaxed code-scroll"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || (!inputText.trim() && !hasCodeOrError)}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center disabled:cursor-not-allowed group"
              title="Send message (Ctrl+Enter)"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>

        {/* Micro note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span>Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">Ctrl + Enter</kbd> to send</span>
          <span>Powered by Gemini 3.8 Flash Autonomous Agent</span>
        </div>
      </div>
    </div>
  );
};
