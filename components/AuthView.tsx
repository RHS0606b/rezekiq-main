import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './icons/Icon';
import { User } from '../types';

interface AuthViewProps {
  mode: 'login' | 'register';
  onAuth: (mode: 'login' | 'register', data: any) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
}

import { translations } from '../translations';

export const AuthView: React.FC<AuthViewProps> = ({ 
  mode, onAuth, onSwitchMode, onBack, theme, toggleTheme, language, setLanguage 
}) => {
  const t = translations[language || 'id'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name || !email || !password || !confirmPassword || !phone) {
        setError(t.allFieldsRequired);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordsDoNotMatch);
        return;
      }
      onAuth('register', { name, email, password, gender, phoneNumber: phone });
    } else {
      if (!email || !password) {
        setError(t.loginRequired);
        return;
      }
      onAuth('login', { email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center sm:p-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Top Bar for Auth */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest bg-white/50 dark:bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
        >
          <Icon size={18}><path d="m15 18-6-6 6-6"/></Icon>
          {t.back}
        </motion.button>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="px-3 py-1.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] shadow-sm border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm"
            >
                {language.toUpperCase()}
            </button>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-500 shadow-sm border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm"
            >
                <Icon size={18}>
                    {theme === 'light' ? <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/> : (
                        <>
                            <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                        </>
                    )}
                </Icon>
            </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        className={`w-full min-h-screen sm:min-h-0 ${mode === 'register' ? 'max-w-4xl' : 'max-w-md'} bg-white dark:bg-gray-900 sm:rounded-[40px] shadow-2xl border-white dark:border-gray-800 overflow-hidden relative transition-all duration-500`}
      >
        <div className="p-8 pb-12 sm:pb-8 md:p-12 mt-20 sm:mt-0">
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              layoutId="auth-logo">
              <img
              src="/logo.png"
              alt="Logo"
              className="w-55 h-24 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
            />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center leading-none mb-2">
              {mode === 'login' ? t.loginTitle : t.registerTitle}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
              {t.authSlogan}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`grid grid-cols-1 ${mode === 'register' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
              <AnimatePresence mode="popLayout" initial={false}>
                {mode === 'register' && (
                  <motion.div 
                    key="name"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.name}</label>
                    <div className="relative">
                        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
                            placeholder="John Doe"
                        />
                    </div>
                  </motion.div>
                )}
                {mode === 'register' && (
                  <motion.div 
                    key="phone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.phone}</label>
                    <div className="relative">
                        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>
                        <input 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
                            placeholder="0812..."
                        />
                    </div>
                  </motion.div>
                )}
                {mode === 'register' && (
                  <motion.div 
                    key="gender"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.gender}</label>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setGender('Laki-laki')}
                            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${gender === 'Laki-laki' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 dark:text-gray-500'}`}
                        >
                            {t.male}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setGender('Perempuan')}
                            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${gender === 'Perempuan' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 dark:text-gray-500'}`}
                        >
                            {t.female}
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={mode === 'register' ? 'md:col-span-2' : ''}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.email}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></Icon>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.password}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-500 transition-colors"
                  >
                    <Icon size={18}>
                        {showPassword ? [
                            <path key="p1" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>,
                            <path key="p2" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>,
                            <path key="p3" d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>,
                            <line key="l1" x1="2" y1="2" x2="22" y2="22"/>
                        ] : [
                            <path key="p1" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>,
                            <circle key="c1" cx="12" cy="12" r="3"/>
                        ]}
                    </Icon>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {mode === 'register' && (
                  <motion.div 
                    key="confirmPassword"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t.confirmPassword}</label>
                    <div className="relative">
                      <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"><path d="m12 14 4-4"/><path d="m3.34 19 6.35-6.35a2 2 0 0 1 2.83 0L19 19"/><path d="m14.5 9.5 4.5-4.5"/><path d="M16 5h5v5"/></Icon>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-gray-800 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs font-bold text-rose-500 px-1"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
              >
                {mode === 'login' ? t.loginBtn : t.registerBtn}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mode === 'login' ? t.noAccount : t.hasAccount} </span>
            <button 
              onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
            >
              {mode === 'login' ? t.switchRegister : t.switchLogin}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
