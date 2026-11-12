/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInputBar } from './components/ChatInputBar';
import { HowItWorksModal } from './components/HowItWorksModal';
import { FrameworkLanguage, AnalysisResult, HistorySession, ChatMessage } from './types';
import {
  JAVASCRIPT_SAMPLE_SCENARIO,
  REACT_SAMPLE_SCENARIO,
  CSS_SAMPLE_SCENARIO,
  getAnalysisForInput,
} from './data/sampleScenarios';
import {
  Bot,
  Menu,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  HelpCircle,
  Check,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';

const STORAGE_SESSIONS_KEY = 'fixmyerror_chatbot_sessions_v2';
const STORAGE_CHAT_KEY = 'fixmyerror_chatbot_thread_v2';
const STORAGE_THEME_KEY = 'fixmyerror_theme_mode';

export default function App() {
  const [language, setLanguage] = useState<FrameworkLanguage>('javascript');
  const [code, setCode] = useState<string>(JAVASCRIPT_SAMPLE_SCENARIO.code);
  const [errorText, setErrorText] = useState<string>(JAVASCRIPT_SAMPLE_SCENARIO.error);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFloatingMode, setIsFloatingMode] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(true);

  // Theme state: 'light' or 'midnight'
  const [theme, setTheme] = useState<'light' | 'midnight'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'midnight' || saved === 'light') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'midnight';
      }
    } catch {
      // Ignore
    }
    return 'light';
  });

  // Sync theme with documentElement
  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'midnight' ? 'light' : 'midnight'));
    showToast(theme === 'midnight' ? 'Switched to Light mode' : 'Switched to Deep Midnight dark mode');
  };

  // Initialize messages thread
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        content:
          "👋 Hello! I'm FixMyError AI Agent. I'm an autonomous debugging chatbot built for web developers.\n\nPaste your JavaScript, React, or CSS code along with the console error below, or pick a sample bug template to see how I diagnose issues, craft safe patches, and provide verification steps.",
        timestamp: 'Just now',
      },
    ];
  });

  // History sessions list
  const [historySessions, setHistorySessions] = useState<HistorySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showToast = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  // Preset loaders
  const handleLoadPreset = (presetLang: FrameworkLanguage) => {
    setLanguage(presetLang);
    if (presetLang === 'javascript') {
      setCode(JAVASCRIPT_SAMPLE_SCENARIO.code);
      setErrorText(JAVASCRIPT_SAMPLE_SCENARIO.error);
    } else if (presetLang === 'react') {
      setCode(REACT_SAMPLE_SCENARIO.code);
      setErrorText(REACT_SAMPLE_SCENARIO.error);
    } else {
      setCode(CSS_SAMPLE_SCENARIO.code);
      setErrorText(CSS_SAMPLE_SCENARIO.error);
    }
    showToast(`Loaded ${presetLang} sample bug into attachment drawer`);
  };

  // Send message handler
  const handleSendMessage = useCallback(
    async (
      userText: string,
      attachedCode?: string,
      attachedError?: string,
      lang: FrameworkLanguage = language
    ) => {
      if (isLoading) return;

      const userMsgId = `user-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newUserMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: userText,
        timestamp: nowStr,
        attachedCode,
        attachedError,
        language: lang,
      };

      setMessages((prev) => [...prev, newUserMsg]);
      setIsLoading(true);

      const hasCodeOrError = Boolean(attachedCode || attachedError);

      try {
        if (hasCodeOrError) {
          // Perform autonomous diagnosis
          let diagnosisData: AnalysisResult | null = null;

          try {
            const diagResponse = await fetch('/api/agent/diagnose', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: lang,
                code: attachedCode || '',
                errorText: attachedError || '',
                goal: userText,
              }),
            });

            if (diagResponse.ok) {
              const resJson = await diagResponse.json();
              if (resJson.success) {
                diagnosisData = resJson;
              }
            }
          } catch {
            // Fallback
          }

          if (!diagnosisData) {
            diagnosisData = getAnalysisForInput(lang, attachedCode || '', attachedError || '');
          }

          // Build bot response
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'model',
            content: `I have completed an autonomous inspection of your ${lang} error. Below is the full diagnosis artifact including root cause analysis, code diff, and verification steps:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            diagnosis: diagnosisData,
          };

          setMessages((prev) => [...prev, botMsg]);

          // Save to history
          const newSession: HistorySession = {
            id: `session-${Date.now()}`,
            createdAt: Date.now(),
            formattedTime: nowStr,
            language: lang,
            code: attachedCode || '',
            errorText: attachedError || '',
            errorTitle: diagnosisData.errorName || `${lang.toUpperCase()} Debug Session`,
            analysisResult: diagnosisData,
          };

          setHistorySessions((prev) => {
            const filtered = prev.filter(
              (s) =>
                !(
                  s.code.trim() === (attachedCode || '').trim() &&
                  s.errorText.trim() === (attachedError || '').trim()
                )
            );
            const updated = [newSession, ...filtered].slice(0, 5);
            try {
              localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(updated));
            } catch {
              // Ignore
            }
            return updated;
          });
        } else {
          // Conversational chat query
          const chatResponse = await fetch('/api/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, newUserMsg].map((m) => ({
                role: m.role,
                content: m.content,
              })),
              context: {
                language: lang,
                code,
                errorText,
              },
            }),
          });

          const data = await chatResponse.json();
          const replyText =
            data.reply ||
            "I'm here to help you understand and resolve web development errors. If you attach your code snippet and the error stack trace using the button below, I'll generate a complete before/after fix and verification checklist!";

          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'model',
            content: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, botMsg]);
        }
      } catch {
        const errorFallbackMsg: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content:
            "I've encountered a temporary connection glitch. When debugging JavaScript and React, always check whether parent variables are initialized before reading child properties (e.g. using `items || []` or optional chaining `items?.map(...)`).",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorFallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [code, errorText, language, messages, isLoading]
  );

  const handleCopyFix = (snippet: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet);
    }
    setIsCopied(true);
    showToast('Fix copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleApplyFixToEditor = (fixedCode: string) => {
    setCode(fixedCode);
    showToast('Applied fix to attachment code editor!');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content:
          "👋 Starting a new debug session. What error or code snippet would you like me to analyze?",
        timestamp: 'Just now',
      },
    ]);
    setCode('');
    setErrorText('');
    showToast('Started new debug session');
  };

  const handleSelectHistory = (session: HistorySession) => {
    setLanguage(session.language);
    setCode(session.code);
    setErrorText(session.errorText);

    // Append session as a revived conversation turn
    const revivedUserMsg: ChatMessage = {
      id: `revived-user-${Date.now()}`,
      role: 'user',
      content: `Restored previous session: ${session.errorTitle}`,
      timestamp: session.formattedTime,
      attachedCode: session.code,
      attachedError: session.errorText,
      language: session.language,
    };

    const revivedBotMsg: ChatMessage = {
      id: `revived-bot-${Date.now()}`,
      role: 'model',
      content: `Here is the restored diagnosis for **${session.errorTitle}**:`,
      timestamp: session.formattedTime,
      diagnosis: session.analysisResult || undefined,
    };

    setMessages((prev) => [...prev, revivedUserMsg, revivedBotMsg]);
    showToast(`Restored session from ${session.formattedTime}`);
  };

  const handleClearHistory = () => {
    setHistorySessions([]);
    try {
      localStorage.removeItem(STORAGE_SESSIONS_KEY);
    } catch {
      // Ignore
    }
    showToast('History cleared');
  };

  return (
    <div className="h-screen w-screen flex bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        historySessions={historySessions}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
        onLoadPreset={handleLoadPreset}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Chatbot Workspace */}
      <main className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 overflow-hidden relative transition-colors duration-200">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 flex items-center justify-between shrink-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                FixMyError Agent
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2 py-0.5 rounded-full items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Chatbot Active</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme switcher toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === 'midnight' ? 'Switch to Light mode' : 'Switch to Deep Midnight dark mode'}
            >
              {theme === 'midnight' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300">Midnight</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>How it works</span>
            </button>

            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFloatingMode((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Toggle between full console and floating agent widget"
            >
              {isFloatingMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">
                {isFloatingMode ? 'Full Console' : 'Floating Widget View'}
              </span>
            </button>
          </div>
        </header>

        {/* Floating Mode Overlay Representation */}
        {isFloatingMode ? (
          <div className="flex-1 bg-slate-950/90 relative p-6 flex flex-col items-center justify-center">
            {/* Background simulated IDE */}
            <div className="max-w-2xl text-center space-y-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                FixMyError Floating Agent Mode
              </h2>
              <p className="text-sm leading-relaxed text-slate-400 max-w-md mx-auto">
                The agent is now active in floating chatbot mode. Click the bottom-right bubble to interact with your autonomous debugging copilot while working in your editor!
              </p>
              <button
                type="button"
                onClick={() => setIsFloatingMode(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Switch back to Fullscreen Agent
              </button>
            </div>

            {/* Floating Chat Widget in Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
              {isFloatingOpen && (
                <div className="w-[420px] max-w-[90vw] h-[580px] bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-3 animate-fadeIn">
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">FixMyError Agent</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFloatingOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 code-scroll bg-[#F8FAFC] dark:bg-[#0B0F19]">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`text-xs ${
                          msg.role === 'model'
                            ? 'bg-white dark:bg-[#161F30] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-slate-800 dark:text-slate-200'
                            : 'bg-blue-600 text-white p-3 rounded-xl ml-6'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.diagnosis && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                            ✓ Diagnosis artifact generated in full console
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 p-2 bg-white dark:bg-[#161F30] rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        <span>Agent reasoning...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsFloatingMode(false)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer"
                    >
                      Expand to Full Agent Console
                    </button>
                  </div>
                </div>
              )}

              {/* Launcher Bubble */}
              <button
                type="button"
                onClick={() => setIsFloatingOpen((prev) => !prev)}
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Toggle FixMyError Agent"
              >
                <Bot className="w-7 h-7" />
              </button>
            </div>
          </div>
        ) : (
          /* Fullscreen Chatbot Thread */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Scrollable Conversation Stream */}
            <div className="flex-1 overflow-y-auto code-scroll">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onCopyFix={handleCopyFix}
                  isCopied={isCopied}
                  onSendFollowUp={(promptText) => handleSendMessage(promptText)}
                  onApplyFixToEditor={handleApplyFixToEditor}
                  onOpenChatDrawer={() => {}}
                />
              ))}

              {isLoading && (
                <div className="py-6 bg-slate-50/50 dark:bg-[#0E1524]/60 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                      <span className="font-medium">
                        FixMyError Agent is inspecting AST and synthesizing a verified patch...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Input Dock */}
            <ChatInputBar
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              language={language}
              onLanguageChange={setLanguage}
              code={code}
              setCode={setCode}
              errorText={errorText}
              setErrorText={setErrorText}
              onLoadPreset={handleLoadPreset}
            />
          </div>
        )}
      </main>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* How it works modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onLoadSample={() => handleLoadPreset('javascript')}
      />
    </div>
  );
}
