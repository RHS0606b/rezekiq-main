import React, { useState, useRef, useEffect } from 'react';
import { getAIReflection } from '../services/geminiService';
import { ChatMessage, SoundType, User } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface RizqAIChatProps {
  playSound: (type: SoundType) => void;
  user: User;
}

export const RizqAIChat: React.FC<RizqAIChatProps> = ({ playSound, user }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: t.coachWelcome }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    playSound('send');

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
        const aiResponse = await getAIReflection(userInput, chatHistory);
        
        const modelMessage: ChatMessage = { role: 'model', content: aiResponse };
        setMessages(prev => [...prev, modelMessage]);
        playSound('receive');
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', content: t.coachError }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto rounded-[40px] overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-2xl">
      {/* Header AI */}
      <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl animate-pulse">
                    🤖
                </div>
                <div>
                    <h3 className="font-black uppercase tracking-tight text-lg">Rizq Reflection AI</h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.coachActive}</span>
                    </div>
                </div>
            </div>
            <div className="hidden sm:flex gap-2">
                <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Level 8</div>
            </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
        <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
            <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-sm font-black shadow-lg ${
                    msg.role === 'model' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                    {msg.role === 'model' ? t.coachAi : t.coachYou}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[32px] ${
                    msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-xl shadow-emerald-200 dark:shadow-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm'
                }`}>
                    <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
            </motion.div>
            ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-4"
          >
             <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-black animate-pulse">AI</div>
            <div className="p-4 rounded-[24px] bg-white dark:bg-gray-800 rounded-tl-none border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 px-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t.coachPlaceholder}
              className="w-full pl-6 pr-16 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
              disabled={isLoading}
            />
            <button 
                type="submit" 
                className="absolute right-2 p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg active:scale-90" 
                disabled={isLoading || !userInput.trim()}
            >
              <Icon size={22}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-[0.2em] mt-4">Powered by Gemini AI Engine</p>
      </div>
    </div>
  );
};