import React, { useState } from 'react';
import { ChatMessage, AnalysisResult } from '../types';
import { AnalysisCard } from './AnalysisCard';
import { Bot, User, Code, AlertCircle, Copy, Check, ChevronRight } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onCopyFix: (snippet: string) => void;
  isCopied: boolean;
  onSendFollowUp: (prompt: string) => void;
  onApplyFixToEditor?: (code: string) => void;
  onOpenChatDrawer?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onCopyFix,
  isCopied,
  onSendFollowUp,
  onApplyFixToEditor,
  onOpenChatDrawer,
}) => {
  const isBot = message.role === 'model';
  const [copiedText, setCopiedText] = useState(false);

  const handleCopyMessage = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message.content);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div
      className={`py-4 sm:py-6 border-b border-slate-100 dark:border-slate-800/80 ${
        isBot ? 'bg-slate-50/50 dark:bg-[#0E1524]/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isBot
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 dark:bg-slate-700 text-slate-100'
          }`}
        >
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBot ? 'FixMyError Agent' : 'You'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {message.timestamp}
              </span>
              {isBot && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-900/60">
                  gemini-3.8-flash
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy message text"
            >
              {copiedText ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* User Attached Context Chips */}
          {!isBot && (message.attachedCode || message.attachedError) && (
            <div className="space-y-2 pt-1">
              {message.attachedError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 rounded-xl text-rose-950 dark:text-rose-200 font-mono text-xs overflow-x-auto code-scroll">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-[11px] font-semibold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Attached Error</span>
                  </div>
                  <pre className="whitespace-pre">{message.attachedError}</pre>
                </div>
              )}

              {message.attachedCode && (
                <div className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto code-scroll border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 pb-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      <span>Attached Code Snippet</span>
                    </span>
                    <span className="text-[10px] uppercase text-blue-400">
                      {message.language || 'code'}
                    </span>
                  </div>
                  <pre className="whitespace-pre">{message.attachedCode}</pre>
                </div>
              )}
            </div>
          )}

          {/* Conversational Text */}
          {message.content && (
            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}

          {/* Interactive Autonomous Diagnosis Artifact (when present) */}
          {message.diagnosis && (
            <div className="pt-2">
              <AnalysisCard
                analysis={message.diagnosis}
                onCopyFix={onCopyFix}
                isCopied={isCopied}
                onStartOver={() => {}}
                onOpenChat={() => {
                  if (onOpenChatDrawer) onOpenChatDrawer();
                }}
                onApplyFixToEditor={onApplyFixToEditor}
              />
            </div>
          )}

          {/* Suggested Follow-up Prompts */}
          {message.diagnosis?.suggestedQuestions &&
            message.diagnosis.suggestedQuestions.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Suggested follow-up questions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {message.diagnosis.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSendFollowUp(q)}
                      className="text-xs bg-white dark:bg-[#161F30] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
