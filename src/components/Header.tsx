import React from 'react';
import { Terminal, HelpCircle, Bot, Clock } from 'lucide-react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onOpenChat: () => void;
  onOpenHistory: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onOpenChat,
  onOpenHistory,
  historyCount = 0,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title & subtle category metadata */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                FixMyError
              </span>
              <span className="hidden md:inline-flex text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                AI Agent
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-3 border-l border-slate-200">
            <span>JavaScript</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>React</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>CSS</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean text links) */}
        <nav className="flex items-center gap-5">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Clock className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold border border-slate-200">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span>How it works</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
