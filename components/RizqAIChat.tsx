import React, { useState, useRef, useEffect } from 'react';
import { getAIReflection } from '../services/geminiService';
import { ChatMessage, SoundType, User } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import toast from 'react-hot-toast';

interface RizqAIChatProps {
  playSound: (type: SoundType) => void;
  user: User;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'rezekiq_ai_chat_sessions_v1';

// Parser ringan Markdown (Bold, Lists, Quote/Doa)
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed break-words font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Quote / Doa
        if (trimmed.startsWith('>') || trimmed.startsWith('“') || trimmed.startsWith('"')) {
          return (
            <div
              key={idx}
              className="my-3 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-serif italic shadow-sm"
            >
              {trimmed.replace(/^>\s*/, '')}
            </div>
          );
        }

        // List item bullet (* atau -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0" />
              <span>{parseInlineMarkdown(content)}</span>
            </div>
          );
        }

        // List item angka
        const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 text-sm">
                {matchNumber[1]}.
              </span>
              <span>{parseInlineMarkdown(matchNumber[2])}</span>
            </div>
          );
        }

        // Subheader (### / ##)
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-bold text-base md:text-lg text-emerald-700 dark:text-emerald-300 mt-3 mb-1">
              {headerText}
            </h4>
          );
        }

        return <p key={idx}>{parseInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
};

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-emerald-950 dark:text-emerald-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const RizqAIChat: React.FC<RizqAIChatProps> = ({ playSound, user }) => {
  const language = user?.language || 'id';
  const t = translations[language];

  // Load / init sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat sessions:', e);
    }
    return [
      {
        id: 'session-default',
        title: 'Percakapan Utama',
        createdAt: Date.now(),
        messages: [{ role: 'model', content: t.coachWelcome }]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Active Session helper
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [{ role: 'model', content: t.coachWelcome }];

  // Simpan sessions ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save chat sessions:', e);
    }
  }, [sessions]);

  // Auto scroll ke bawah
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Buat percakapan baru
  const handleNewChat = () => {
    playSound('click');
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Percakapan Baru',
      createdAt: Date.now(),
      messages: [{ role: 'model', content: t.coachWelcome }]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Hapus satu sesi
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // Jika tinggal 1, reset isinya saja
      setSessions([
        {
          id: 'session-' + Date.now(),
          title: 'Percakapan Baru',
          createdAt: Date.now(),
          messages: [{ role: 'model', content: t.coachWelcome }]
        }
      ]);
      return;
    }

    if (confirm(t.coachDeleteChatConfirm || 'Hapus obrolan ini?')) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
      playSound('click');
    }
  };

  // Kirim pesan
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text || isLoading) return;

    playSound('send');

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    // Update judul sesi jika masih "Percakapan Baru" atau "Percakapan Utama"
    const newTitle =
      activeSession.title === 'Percakapan Baru' || activeSession.title === 'Percakapan Utama'
        ? text.slice(0, 28) + (text.length > 28 ? '...' : '')
        : activeSession.title;

    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, title: newTitle, messages: updatedMessages } : s))
    );

    setUserInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await getAIReflection(text, chatHistory);

      const modelMessage: ChatMessage = { role: 'model', content: aiResponse };

      setSessions(prev =>
        prev.map(s =>
          s.id === activeSession.id ? { ...s, messages: [...updatedMessages, modelMessage] } : s
        )
      );
      playSound('click');
    } catch (error) {
      setSessions(prev =>
        prev.map(s =>
          s.id === activeSession.id
            ? { ...s, messages: [...updatedMessages, { role: 'model', content: t.coachError }] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      toast.success(t.coachCopied || 'Disalin!');
      playSound('click');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      toast.error('Gagal menyalin');
    }
  };

  const quickPrompts = [
    t.coachQuickTopic1,
    t.coachQuickTopic2,
    t.coachQuickTopic3,
    t.coachQuickTopic4
  ].filter(Boolean);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] w-full max-w-7xl mx-auto rounded-[32px] overflow-hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xl transition-all">
      
      {/* 1. SIDEBAR RIWAYAT PERCAKAPAN (Mirip Gemini / ChatGPT) */}
      <div
        className={`${
          isSidebarOpen ? 'w-72 md:w-80' : 'w-0'
        } transition-all duration-300 ease-in-out flex flex-col bg-gray-50/90 dark:bg-gray-950/70 border-r border-gray-200/70 dark:border-gray-800/80 overflow-hidden flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-2">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Icon size={18}>
              <path d="M12 5v14m-7-7h14" />
            </Icon>
            <span>{t.coachNewChat}</span>
          </button>
        </div>

        {/* Daftar Riwayat */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 py-1">
            {t.coachHistoryTitle}
          </p>
          {sessions.map(s => {
            const isActive = s.id === activeSession.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  playSound('click');
                }}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base flex-shrink-0">{isActive ? '💬' : '🗨️'}</span>
                  <span className="truncate text-xs md:text-sm">{s.title}</span>
                </div>
                <button
                  onClick={e => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-950/60 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  title="Hapus"
                >
                  <Icon size={14}>
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </Icon>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. AREA UTAMA CHAT (Lega, Bersih, Modern) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafcfa] dark:bg-gray-900">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-white/70 dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Toggle Sidebar"
            >
              <Icon size={20}>
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M9 3v18" />
              </Icon>
            </button>
            <div>
              <h3 className="font-black text-gray-800 dark:text-gray-100 text-base md:text-lg tracking-tight flex items-center gap-2">
                <span>Rizq Reflection AI</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  2.0 Flash
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                {activeSession.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Icon size={14}><path d="M12 5v14m-7-7h14" /></Icon>
              <span>{t.coachNewChat}</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6 scroll-smooth custom-scrollbar"
        >
          {messages.length === 1 && (
            <div className="text-center py-6 md:py-10 max-w-xl mx-auto space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white text-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                🌿
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100">
                Ada yang ingin Anda tanyakan hari ini?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Konsultasikan seputar ikhtiar, rasa syukur, doa, atau amalan pembuka 8 pintu rezeki.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAI = msg.role === 'model';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 md:gap-4 max-w-3xl mx-auto ${
                    isAI ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAI && (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex-shrink-0 flex items-center justify-center text-sm font-black shadow-md mt-1">
                      🤖
                    </div>
                  )}

                  <div className={`flex flex-col group max-w-[88%] md:max-w-[82%]`}>
                    <div
                      className={`p-4 md:p-5 rounded-[26px] shadow-sm relative ${
                        !isAI
                          ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                          : 'bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/70 dark:border-gray-700/80'
                      }`}
                    >
                      {isAI ? (
                        <FormattedMessage text={msg.content} />
                      ) : (
                        <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {/* Action Bar (Copy Button) */}
                    {isAI && (
                      <div className="flex items-center gap-2 mt-1.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="text-[11px] font-semibold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                          title={t.coachCopy}
                        >
                          <Icon size={12}>
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </Icon>
                          <span>{copiedIndex === index ? t.coachCopied : t.coachCopy}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-black shadow-md mt-1">
                      {user?.gender === 'Perempuan' ? '🧕' : '👤'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 md:gap-4 max-w-3xl mx-auto justify-start items-center">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-sm font-black shadow-md animate-pulse">
                ✨
              </div>
              <div className="p-4 rounded-[22px] bg-white dark:bg-gray-800 rounded-tl-none border border-gray-200/70 dark:border-gray-700/80 flex items-center space-x-2">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-pulse mr-1">
                  Merenungkan...
                </span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s]" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 md:px-12 pb-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-2xl bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700/80 border border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar (Mirip Gemini/ChatGPT, Luas & Nyaman) */}
        <div className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <textarea
                rows={1}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t.coachPlaceholder}
                disabled={isLoading}
                className="w-full pl-5 pr-16 py-4 bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-200/80 dark:border-gray-700 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none font-medium text-sm md:text-base text-gray-800 dark:text-white placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="absolute right-2.5 p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-md shadow-emerald-600/20 active:scale-90"
                title="Kirim pesan"
              >
                <Icon size={18}>
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </Icon>
              </button>
            </form>
            <p className="text-[10px] text-center text-gray-400 font-semibold uppercase tracking-[0.2em] mt-2.5">
              RezekiQ AI Mentorship • Gemini Engine
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};