import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User;
  logout: () => void;
  updateUser: (user: User) => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  lastSyncedAt?: string | null;
  onSync?: () => Promise<any> | void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, onMenuClick, theme, toggleTheme, user, logout, updateUser,
  syncStatus = 'idle', lastSyncedAt, onSync 
}) => {
  const navigate = useNavigate();
  const language = user?.language || 'id';
  const t = translations[language];
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const currentLang = user?.language || 'id';
    const newLang = currentLang === 'id' ? 'en' : 'id';
    if (user) {
        updateUser({ ...user, language: newLang });
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dummyAvatar = (gender: string) => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
        {gender === 'Perempuan' ? '🧕' : '👤'}
    </div>
  );

  return (
    <header className="sticky top-0 z-[45] w-full px-6 py-4 md:px-10 bg-white/50 dark:bg-gray-950/50 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between transition-all duration-500">
      <div className="flex items-center gap-5 truncate">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="md:hidden p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 transition-colors"
          aria-label="Open menu"
        >
          <Icon size={20}>
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
          </Icon>
        </motion.button>
        <div className="flex flex-col truncate">
            <motion.h1 
                key={title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl md:text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent truncate uppercase tracking-tight"
            >
              {title}
            </motion.h1>
            <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{isOnline ? t.systemOnline : t.connectionLost}</span>
                </div>
                {syncStatus !== 'idle' && (
                  <button 
                    onClick={() => onSync && onSync()}
                    title={lastSyncedAt ? `${t.lastSyncedAt}: ${lastSyncedAt}` : t.cloudSyncNow}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105"
                  >
                    {syncStatus === 'syncing' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span className="text-amber-600 dark:text-amber-400">{t.cloudSyncing}</span>
                      </>
                    ) : syncStatus === 'synced' ? (
                      <>
                        <span className="text-emerald-500 text-[10px]">☁️✓</span>
                        <span className="text-emerald-700 dark:text-emerald-300">{t.cloudSynced}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 text-[10px]">📶</span>
                        <span className="text-gray-500 dark:text-gray-400">{t.cloudOffline}</span>
                      </>
                    )}
                  </button>
                )}
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="px-3 py-2 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
        >
          {user.language === 'id' ? 'ID' : 'EN'}
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95, rotate: -5 }}
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-800"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
            >
                {theme === 'light' ? (
                    <Icon size={20}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></Icon>
                ) : (
                    <Icon size={20}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></Icon>
                )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-emerald-500/20 p-0.5 bg-white dark:bg-gray-900 shadow-lg"
            >
                {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                    dummyAvatar(user.gender || 'Laki-laki')
                )}
            </motion.button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden p-2 backdrop-blur-3xl bg-white/90 dark:bg-gray-900/90"
                    >
                        <button
                            onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <Icon size={18}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
                            <span className="text-sm font-bold">{t.profilAkunMenu}</span>
                        </button>
                        {onSync && (
                          <button
                              onClick={() => { onSync(); setIsDropdownOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                          >
                              <Icon size={18}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></Icon>
                              <span className="text-sm font-bold">{t.cloudSyncNow}</span>
                          </button>
                        )}
                        <hr className="my-1 border-gray-100 dark:border-gray-800" />
                        <button
                            onClick={() => { logout(); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
                        >
                            <Icon size={18}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
                            <span className="text-sm font-bold">{t.logout}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
