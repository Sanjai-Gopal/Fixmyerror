import React from 'react';
import { HistorySession, FrameworkLanguage } from '../types';
import {
  Plus,
  MessageSquare,
  History,
  Trash2,
  Terminal,
  HelpCircle,
  Sparkles,
  Bot,
  Sun,
  Moon,
} from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  historySessions: HistorySession[];
  onSelectHistory: (session: HistorySession) => void;
  onClearHistory: () => void;
  onLoadPreset: (lang: FrameworkLanguage) => void;
  onOpenHowItWorks: () => void;
  theme?: 'light' | 'midnight';
  onToggleTheme?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  historySessions,
  onSelectHistory,
  onClearHistory,
  onLoadPreset,
  onOpenHowItWorks,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0B0F19] text-slate-100 flex flex-col border-r border-slate-800/90 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">FixMyError</span>
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-1 py-0.2 rounded border border-blue-800">
                  Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Debugging Chatbot</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Debug Session</span>
          </button>
        </div>

        {/* Quick Debug Presets */}
        <div className="px-3 py-2 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block px-1 mb-1.5">
            Quick Bug Templates
          </span>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onLoadPreset('javascript');
                onClose();
              }}
              className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">items.map undefined</span>
              <span className="text-[10px] font-mono text-amber-400">.js</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadPreset('react');
                onClose();
              }}
              className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">Props undefined</span>
              <span className="text-[10px] font-mono text-cyan-400">.jsx</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadPreset('css');
                onClose();
              }}
              className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">z-index stacking bug</span>
              <span className="text-[10px] font-mono text-purple-400">.css</span>
            </button>
          </div>
        </div>

        {/* History Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 code-scroll">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Recent Sessions ({historySessions.length})
            </span>
            {historySessions.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Clear history"
              >
                Clear
              </button>
            )}
          </div>

          {historySessions.length === 0 ? (
            <div className="text-center py-6 px-2 text-[11px] text-slate-400">
              No previous chats saved. Debug an error to save it here.
            </div>
          ) : (
            historySessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  onSelectHistory(session);
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer group flex flex-col gap-0.5 border border-slate-800/60"
              >
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                  <span className="font-mono uppercase font-semibold text-blue-400">
                    {session.language}
                  </span>
                  <span>{session.formattedTime}</span>
                </div>
                <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                  {session.errorTitle || 'Debug Session'}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Bottom Agent Telemetry info, theme switcher & guide */}
        <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
          {/* Theme switcher button in sidebar */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
            >
              <div className="flex items-center gap-2">
                {theme === 'midnight' ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>Theme: {theme === 'midnight' ? 'Deep Midnight' : 'Light'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Toggle</span>
            </button>
          )}

          <div className="flex items-center justify-between px-1 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Gemini 3.8 Flash</span>
            </div>
            <span>Online</span>
          </div>

          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How the Agent Works</span>
          </button>
        </div>
      </aside>
    </>
  );
};
