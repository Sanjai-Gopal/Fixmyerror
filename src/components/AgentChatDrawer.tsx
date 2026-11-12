import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, FrameworkLanguage } from '../types';
import { Send, Bot, User, Sparkles, MessageSquare, X, ChevronRight, CornerDownLeft } from 'lucide-react';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: FrameworkLanguage;
  code: string;
  errorText: string;
  fixSnippet: string;
  suggestedQuestions?: string[];
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  language,
  code,
  errorText,
  fixSnippet,
  suggestedQuestions = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello! I'm your FixMyError AI Agent. I've analyzed your ${language} bug. Feel free to ask me follow-up questions, request alternative ways to fix it (like using TypeScript or modern operators), or ask how to write automated tests.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            language,
            code,
            errorText,
            fixSnippet,
          },
        }),
      });

      const data = await response.json();
      const botReply = data.reply || "I analyzed your query. To write clean code, consider always guarding against undefined values early in your function's execution.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: "In defensive programming, ensuring your data contracts match expectations (or fallbacking to empty structures `[]` or `{}`) prevents runtime exceptions.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">FixMyError Agent Copilot</h3>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                  Live Agent
                </span>
              </div>
              <p className="text-xs text-slate-500">Ask any follow-up question about this bug</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 code-scroll">
          {messages.map((m) => {
            const isBot = m.role === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isBot ? 'items-start' : 'items-start flex-row-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                    isBot ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                    isBot
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/80'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <span
                    className={`block mt-1 text-[10px] ${
                      isBot ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/60">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-600 ml-1">Agent reasoning...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Pill Strip */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Suggested questions:
            </span>
            <div className="flex flex-col gap-1.5">
              {suggestedQuestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={isSending}
                  className="text-left text-xs text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Agent a follow-up question..."
              className="flex-1 bg-slate-100 text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <span className="text-[11px] text-slate-400 text-center block mt-1.5">
            Powered by Gemini 3.8 Flash Agent
          </span>
        </div>
      </div>
    </div>
  );
};
