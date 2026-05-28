'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Bot,
  Send,
  Trash2,
  User,
  Sparkles,
  Loader2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Suggested questions ────────────────────────────────────
const SUGGESTIONS = [
  'Berapa kupon yang belum digunakan?',
  'Tampilkan statistik kupon',
  'Berapa kupon extra?',
  'Berapa kupon sudah digunakan hari ini?',
  'Ada berapa total kupon?',
  'Berapa kupon terdaftar yang sudah diambil?',
];

// ── Simple markdown-ish renderer ───────────────────────────
function renderMarkdown(text: string) {
  // Split by line, process each
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    let processed: React.ReactNode = line;

    // Bold **text**
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      processed = parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={`b-${key}-${i}`} className="font-bold text-emerald-300">
            {part}
          </strong>
        ) : (
          <span key={`s-${key}-${i}`}>{part}</span>
        )
      );
    }

    // Italic *text*
    if (typeof processed === 'string' && processed.includes('*') && !processed.includes('**')) {
      const parts = processed.split(/\*(.*?)\*/g);
      processed = parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={`i-${key}-${i}`} className="italic text-slate-300">
            {part}
          </em>
        ) : (
          <span key={`si-${key}-${i}`}>{part}</span>
        )
      );
    }

    // Bullet list items
    if (line.trimStart().startsWith('- ')) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 pl-2 py-0.5">
          <span className="text-emerald-400 mt-1.5 text-[8px]">●</span>
          <span className="flex-1">{typeof processed === 'string' ? processed.replace(/^-\s*/, '') : processed}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <div key={key++} className="py-0.5">
          {processed}
        </div>
      );
    }
  }

  return elements;
}

// ── Typing indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      {/* Bubble */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────
export default function AssistantPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Send message
  const handleSend = async (messageOverride?: string) => {
    const msg = (messageOverride || input).trim();
    if (!msg || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const token = getToken();
      const reply = await api.sendAssistantChat(token, msg);

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi AI Assistant.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      // Re-focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // ── Empty State ─────────────────────────────────────────
  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-6 animate-in fade-in duration-500">
      {/* Glowing Icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl scale-150 animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">AI Assistant Kupon Qurban</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Tanyakan apapun tentang data kupon qurban. Saya akan memberikan jawaban berdasarkan data real-time dari sistem.
        </p>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg mt-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl transition-all duration-200 hover:text-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 disabled:opacity-50 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                AI Assistant
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                  ONLINE
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by DeepSeek AI via OpenRouter
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Hapus riwayat chat"
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Messages Area ── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {messages.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] group relative ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50 rounded-2xl rounded-bl-md shadow-lg'
                    } px-4 py-3`}
                  >
                    {/* Content */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-2 ${
                        msg.role === 'user' ? 'text-blue-200/70 text-right' : 'text-slate-500'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && <TypingIndicator />}
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="flex-shrink-0 border-t border-slate-800/50 pt-3 pb-2 px-2">
          {/* Quick suggestions when chat is active */}
          {messages.length > 0 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-1">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  disabled={isLoading}
                  className="flex-shrink-0 px-3 py-1.5 text-[11px] font-medium text-slate-400 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/40 hover:border-emerald-500/30 rounded-lg transition-all duration-200 hover:text-emerald-300 disabled:opacity-50 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan tentang kupon qurban..."
                rows={1}
                disabled={isLoading}
                className="w-full resize-none bg-slate-800/60 border border-slate-700/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 disabled:opacity-50 max-h-[120px]"
              />
              {/* Character count */}
              {input.length > 400 && (
                <span className="absolute bottom-2 right-14 text-[10px] text-slate-500">
                  {input.length}/500
                </span>
              )}
            </div>

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              title="Kirim pertanyaan"
              className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 mt-2.5">
            AI Assistant menggunakan data real-time dari database kupon qurban.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
