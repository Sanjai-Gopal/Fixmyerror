import React from 'react';
import { HistorySession } from '../types';
import { History, X, Trash2, ArrowUpRight, Clock, FileCode } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HistorySession[];
  onSelectSession: (session: HistorySession) => void;
  onClearHistory: () => void;
  onDeleteSession: (id: string) => void;
  activeSessionId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onClearHistory,
  onDeleteSession,
  activeSessionId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="history-title" className="font-bold text-slate-900 text-sm">
                  Debugging History
                </h3>
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  {sessions.length}/5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Last 5 error sessions saved in localStorage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                title="Clear all stored sessions"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 code-scroll">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No sessions recorded yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                When you run an analysis on an error, your code, error message, and diagnosis will be automatically saved here.
              </p>
            </div>
          ) : (
            sessions.map((session, idx) => {
              const isSelected = activeSessionId === session.id;
              return (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs'
                  }`}
                  onClick={() => {
                    onSelectSession(session);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider font-mono">
                        {session.language}
                      </span>
                      <span className="text-slate-300 text-xs">·</span>
                      <span className="text-[11px] text-slate-400">
                        {session.formattedTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete this session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {session.errorTitle || 'Unknown Error'}
                  </h4>

                  {/* Code preview snippet */}
                  <div className="mt-2 p-2 bg-slate-900 text-slate-300 rounded-lg font-mono text-[11px] overflow-hidden max-h-14 leading-relaxed line-clamp-2">
                    {session.code || '// No code provided'}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/60">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      <FileCode className="w-3 h-3" />
                      <span>{session.code.split('\n').length} lines</span>
                    </span>
                    <span className="font-semibold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Restore session
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <span>Keyboard shortcut: press </span>
          <kbd className="font-mono px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
            Esc
          </kbd>
          <span> to close</span>
        </div>
      </div>
    </div>
  );
};
