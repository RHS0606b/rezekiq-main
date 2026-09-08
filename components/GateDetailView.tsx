import React, { useState, useRef, useEffect } from 'react';
import { RizqGate, Amal, CustomAmal, RewardWithProgress, User } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface GateDetailViewProps {
  gate: RizqGate;
  isAmalCompleted: (amalId: string) => boolean;
  toggleAmal: (amalId: string) => void;
  calculateStreak: (amalId: string) => number;
  customAmalan: CustomAmal[];
  addCustomAmal: (gateId: string, name: string, description?: string) => void;
  editCustomAmal: (amalId: string, name: string, description?: string) => void;
  deleteCustomAmal: (amalId: string) => void;
  rewardsWithProgress: RewardWithProgress[];
  user: User;
  playSound: (type: any) => void;
}

const CelebrationOverlay: React.FC<{ gateName: string; onExplore: () => void; language: string }> = ({ gateName, onExplore, language }) => {
    const t = translations[language as 'id' | 'en'];
    return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md"
        />
        <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            className="relative bg-white dark:bg-gray-900 rounded-[50px] p-10 md:p-16 max-w-lg w-full shadow-[0_0_100px_rgba(16,185,129,0.3)] border-4 border-emerald-400 text-center overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50"></div>

            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                }}
                className="text-8xl mb-8 inline-block"
            >
                ✨
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 leading-none">{t.masyaallah}</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-8">{t.gateOpened.replace('{name}', gateName)}</p>
            
            <div className="px-6 py-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] border border-emerald-100 dark:border-emerald-800 mb-10">
                <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">
                    "{t.celebrationMsg}"
                </p>
            </div>

            <button 
                onClick={onExplore}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
            >
                {t.celebrationBtn}
            </button>
        </motion.div>
    </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all relative ${
      active 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{children}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.4)]"
      />
    )}
  </button>
);const AmalItem: React.FC<{ 
  amal: Amal; 
  isCompleted: boolean; 
  onToggle: () => void; 
  streak: number; 
  color: string; 
  onDelete?: () => void; 
  onEdit?: () => void;
  nextStreakReward?: RewardWithProgress;
  language: string; 
}> = ({ amal, isCompleted, onToggle, streak, color, onDelete, onEdit, nextStreakReward, language }) => {
    const t = translations[language as 'id' | 'en'];
    return (
    <motion.div
      layout
      className={`group flex flex-col p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
        isCompleted 
        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-800/30' 
        : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 shadow-sm hover:shadow-md'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start">
        <div className={`mt-1 w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all duration-500 transform group-active:scale-95 ${isCompleted ? `bg-emerald-500 border-emerald-500 rotate-12 scale-110 shadow-lg shadow-emerald-200 dark:shadow-none` : `bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 group-hover:border-emerald-400 group-hover:rotate-6`}`}>
          {isCompleted ? (
            <Icon size={18} className="text-white"><path d="M20 6 9 17l-5-5" /></Icon>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500"></div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <p className={`font-black tracking-tight text-base transition-all duration-300 ${isCompleted ? 'text-emerald-900 dark:text-emerald-300 opacity-50 line-through' : 'text-gray-800 dark:text-white'}`}>{amal.name}</p>
          <p className={`text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed ${isCompleted ? 'opacity-40' : ''}`}>{amal.description}</p>
          
          <div className="flex items-center gap-3 mt-3">
             {streak > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 text-[10px] font-black text-amber-600 dark:text-amber-400">
                    <span>{streak} {t.hariStreak}</span>
                    <span>🔥</span>
                </div>
            )}
            {amal.isCustom && (
                <div className="text-[10px] bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-black border border-sky-100 dark:border-sky-800/50">{t.customLabel}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {amal.isCustom && onEdit && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                >
                    <Icon size={18}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Icon>
                </button>
            )}
            {amal.isCustom && onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                >
                    <Icon size={18}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Icon>
                </button>
            )}
        </div>
      </div>

      {nextStreakReward && !isCompleted && (
        <div className="mt-4 pl-12 pr-4">
          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            <span>{t.nextReward}</span>
            <span>{nextStreakReward.current}/{nextStreakReward.target}d 🔥</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${nextStreakReward.progress}%` }}
               className={`bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full`}
            ></motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const AmalFormModal: React.FC<{ 
    gateId: string; 
    editAmal?: CustomAmal;
    onSave: (name: string, description: string) => void; 
    onCancel: () => void;
    language: string; 
}> = ({ editAmal, onSave, onCancel, language }) => {
    const t = translations[language as 'id' | 'en'];
    const [name, setName] = useState(editAmal?.name || '');
    const [description, setDescription] = useState(editAmal?.description || '');

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-[40px] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Icon size={28}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Icon>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{editAmal ? t.editAmal : t.addAmal}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t.settingsSub}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{t.amalNameLabel}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.amalNamePlaceholder}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-bold text-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">{t.amalDescLabel}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.amalDescPlaceholder}
                            rows={3}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-bold text-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-10">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-4 px-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 uppercase tracking-widest transition-all"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={() => onSave(name, description)}
                        disabled={!name.trim() || !description.trim()}
                        className="flex-1 py-4 px-4 rounded-2xl font-black bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 uppercase tracking-widest active:scale-95"
                    >
                        {editAmal ? t.amalSave : t.amalAdd}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const GateDetailView: React.FC<GateDetailViewProps> = ({ gate, isAmalCompleted, toggleAmal, calculateStreak, customAmalan, addCustomAmal, editCustomAmal, deleteCustomAmal, rewardsWithProgress, user, playSound }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'amalan' | 'info' | 'refleksi'>('amalan');
  const [modalAmal, setModalAmal] = useState<{ type: 'add' | 'edit'; data?: CustomAmal } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    setActiveTab('amalan');
    isCompletedRef.current = false;
  }, [gate]);

  const combinedAmalan: Amal[] = [
    ...gate.amalan,
    ...customAmalan.map(ca => ({ ...ca, isCustom: true }))
  ];

  const allCompleted = combinedAmalan.length > 0 && combinedAmalan.every(a => isAmalCompleted(a.id));

  useEffect(() => {
    if (allCompleted && !isCompletedRef.current) {
        setShowCelebration(true);
        playSound('celebrate');
        isCompletedRef.current = true;
    } else if (!allCompleted) {
        isCompletedRef.current = false;
    }
  }, [allCompleted, playSound]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleSaveAmal = (name: string, description: string) => {
    if (modalAmal?.type === 'edit' && modalAmal.data) {
        editCustomAmal(modalAmal.data.id, name, description);
        showToast(t.amalUpdateSuccess);
    } else {
        addCustomAmal(gate.id, name, description);
        showToast(t.amalAddSuccess);
    }
    setModalAmal(null);
  };

  const handleDeleteAmal = () => {
    if (showDeleteConfirm) {
        deleteCustomAmal(showDeleteConfirm);
        showToast(t.amalDeleteSuccess, 'error');
        setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 20, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="fixed top-24 left-0 right-0 z-[140] flex justify-center pointer-events-none px-4"
                >
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                        toast.type === 'success' 
                        ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                        : 'bg-rose-500/90 border-rose-400 text-white'
                    }`}>
                         <Icon size={20}>
                            {toast.type === 'success' ? (
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4" />
                            ) : (
                                <React.Fragment><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></React.Fragment>
                            )}
                        </Icon>
                        <span className="font-black text-xs uppercase tracking-wider">{toast.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white dark:bg-gray-800 rounded-[40px] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700"
                    >
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                            <Icon size={32}><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Icon>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2 uppercase">{t.deleteAmalConfirm}</h3>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center mb-8 uppercase tracking-widest line-clamp-2">{t.deleteAmalWarning}</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-black text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors uppercase text-xs tracking-widest"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={handleDeleteAmal}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-black bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200 dark:shadow-none transition-all uppercase text-xs tracking-widest"
                            >
                                {t.delete}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {modalAmal && (
                <AmalFormModal 
                    gateId={gate.id}
                    editAmal={modalAmal.data}
                    onSave={handleSaveAmal}
                    onCancel={() => setModalAmal(null)}
                    language={language}
                />
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showCelebration && (
                <CelebrationOverlay 
                    gateName={gate.name} 
                    onExplore={() => setShowCelebration(false)} 
                    language={language}
                />
            )}
        </AnimatePresence>

       <header className={`p-8 md:p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-8 bg-gradient-to-br ${
           gate.color === 'emerald' ? 'from-emerald-500 to-teal-600' :
           gate.color === 'sky' ? 'from-sky-500 to-blue-600' :
           gate.color === 'amber' ? 'from-amber-400 to-orange-500' :
           gate.color === 'indigo' ? 'from-indigo-500 to-violet-600' :
           gate.color === 'rose' ? 'from-rose-500 to-pink-600' :
           gate.color === 'teal' ? 'from-teal-500 to-emerald-600' :
           gate.color === 'fuchsia' ? 'from-fuchsia-500 to-purple-600' :
           'from-slate-500 to-slate-700'
       }`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <span className="text-7xl md:text-8xl drop-shadow-2xl transform hover:rotate-6 transition-transform duration-500">{gate.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-2">{t.gateActivation}</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3">{gate.name}</h2>
              <p className="text-sm md:text-base font-bold opacity-90 max-w-2xl leading-relaxed">{gate.description}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </header>

        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <nav className="border-b border-gray-100 dark:border-gray-800 p-2">
                <div className="flex">
                    <TabButton active={activeTab === 'amalan'} onClick={() => setActiveTab('amalan')} icon={<Icon size={18}><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Icon>}>{t.tabAmalan}</TabButton>
                    <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<Icon size={18}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Icon>}>{t.tabDalil}</TabButton>
                    <TabButton active={activeTab === 'refleksi'} onClick={() => setActiveTab('refleksi')} icon={<Icon size={18}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></Icon>}>{t.tabSkill}</TabButton>
                </div>
            </nav>

            <main className="p-6 md:p-10">
            {activeTab === 'amalan' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{t.checklistDaily}</h3>
                      <button 
                        onClick={() => setModalAmal({ type: 'add' })} 
                        className="p-2 aspect-square md:aspect-auto md:px-4 md:py-2 text-[10px] bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-none transition-all flex items-center gap-2 group active:scale-95"
                        >
                        <Icon size={18} className="group-hover:rotate-90 transition-transform"><path d="M5 12h14m-7 7V5"/></Icon>
                        <span className="hidden md:inline">{t.addCustom}</span>
                      </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {combinedAmalan.map((amal, idx) => {
                        const nextStreakReward = rewardsWithProgress
                          .filter(r => r.type === 'streak' && r.amalId === amal.id && !user.earnedRewards.includes(r.id))
                          .sort((a, b) => a.target - b.target)[0];

                        return (
                          <AmalItem 
                              key={amal.id} 
                              amal={amal} 
                              isCompleted={isAmalCompleted(amal.id)}
                              onToggle={() => toggleAmal(amal.id)} 
                              streak={calculateStreak(amal.id)}
                              color={gate.color} 
                              onDelete={amal.isCustom ? () => setShowDeleteConfirm(amal.id) : undefined}
                              onEdit={amal.isCustom ? () => setModalAmal({ type: 'edit', data: amal as CustomAmal }) : undefined}
                              nextStreakReward={nextStreakReward}
                              language={language}
                          />
                        );
                      })}
                  </div>
                </div>
            )}

            {activeTab === 'info' && (
                <div className="space-y-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center pointer-events-none"><Icon size={18}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Icon></div>
                        {t.dalilPesan}
                    </h3>
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></div>
                        <blockquote className="pl-6 py-4 text-gray-700 dark:text-gray-300 italic font-medium leading-loose text-lg">
                        "{gate.dalil}"
                        </blockquote>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-lg flex items-center justify-center pointer-events-none"><Icon size={18}><path d="M12 2L2 7l10 5 10-5-10-5z"/></Icon></div>
                        {t.kisahInspiratif}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-base first-letter:text-4xl first-letter:font-black first-letter:text-emerald-500 first-letter:mr-1">
                    {gate.kisah}
                    </p>
                </motion.div>
                </div>
            )}

            {activeTab === 'refleksi' && (
              <div className="space-y-10">
                <div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight mb-6">{t.skillBooster}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {gate.skillBooster.map((skill, index) => (
                        <div key={index} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 transition-colors">
                            <h4 className="font-black text-gray-900 dark:text-white uppercase text-sm mb-2 tracking-tight">{skill.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{skill.description}</p>
                        </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100/50 dark:border-emerald-800/30">
                        <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-300 mb-6 uppercase flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center"><Icon size={18}><path d="M20 6 9 17l-5-5" /></Icon></div>
                            {t.dosTitle}
                        </h3>
                        <ul className="space-y-4">
                            {gate.dos.map((item, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 dark:text-emerald-100 font-bold text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-[32px] border border-rose-100/50 dark:border-rose-800/30">
                        <h3 className="text-lg font-black text-rose-800 dark:text-rose-400 mb-6 uppercase flex items-center gap-3">
                            <div className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center"><Icon size={18}><path d="M18 6 6 18M6 6l12 12" /></Icon></div>
                            {t.dontsTitle}
                        </h3>
                        <ul className="space-y-4">
                            {gate.donts.map((item, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                    <span className="text-gray-700 dark:text-rose-100 font-bold text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                 <div className="bg-gray-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-20"><Icon size={80}><path d="M12 2L2 7l10 5 10-5-10-5z"/></Icon></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4">{t.deepReflection}</p>
                        <h3 className="text-2xl font-black mb-6 tracking-tight leading-tight italic">
                          " {gate.reflectionPrompt} "
                        </h3>
                    </div>
                </div>
              </div>
            )}
            </main>
        </div>
    </div>
  );
};