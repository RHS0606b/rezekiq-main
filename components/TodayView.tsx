import React, { useState } from 'react';
import { useRizqData } from '../hooks/useRizqData';
import { Icon } from './icons/Icon';
import { RewardWithProgress } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

type TodayViewProps = ReturnType<typeof useRizqData> & {
    rewardsWithProgress: RewardWithProgress[];
};

export const TodayView: React.FC<TodayViewProps> = ({ rizqGates, customAmalan, todayKey, isAmalCompleted, toggleAmal, user, rewardsWithProgress, toggleAmalanSelection }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [isManaging, setIsManaging] = useState(false);

  const predefinedAmalan = rizqGates.flatMap(gate => gate.amalan.map(amal => ({ ...amal, gateName: gate.name, gateEmoji: gate.emoji, gateId: gate.id })));

  const allCustomAmalan = customAmalan.map(amal => {
    const gate = rizqGates.find(g => g.id === amal.gateId);
    return { 
      ...amal, 
      isCustom: true,
      gateName: gate?.name || t.custom, 
      gateEmoji: gate?.emoji || '📝',
      gateId: amal.gateId
    };
  });

  const allAvailableAmalan = [...predefinedAmalan, ...allCustomAmalan];
  
  // Only tasks that are selected by the user
  const activeAmalan = allAvailableAmalan.filter(a => user.selectedAmalanIds.includes(a.id));
  
  const completedCount = activeAmalan.filter(a => isAmalCompleted(a.id, todayKey)).length;
  const progressPercent = activeAmalan.length > 0 ? Math.round((completedCount / activeAmalan.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* Status Card - Premium Design */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-emerald-200 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative"
        >
            <div className="relative z-10 flex-1 w-full text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></span>
                    {t.edisiHarian}
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase italic leading-tight">{t.misiKeberkahan.split(' ')[0]} <br className="hidden md:block" /> {t.misiKeberkahan.split(' ')[1]}</h3>
                <p className="text-emerald-50/80 text-base font-bold tracking-tight uppercase">{todayKey}</p>
                
                <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/10 flex flex-col items-center md:items-start min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{t.status}</span>
                        <span className="text-2xl font-black">{completedCount} / {activeAmalan.length}</span>
                    </div>
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/10 flex flex-col items-center md:items-start min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{t.aktivasi}</span>
                        <span className="text-2xl font-black">{progressPercent}%</span>
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 w-40 h-40 md:w-52 md:h-52 flex-shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 filter drop-shadow-xl" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <motion.circle 
                        initial={{ strokeDashoffset: 263.9 }}
                        animate={{ strokeDashoffset: progressPercent === 0 ? 263.9 : 263.9 - (263.9 * progressPercent) / 100 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        cx="50" 
                        cy="50" 
                        r="42" 
                        fill="transparent" 
                        stroke="white" 
                        strokeWidth="8" 
                        strokeDasharray="263.9" 
                        strokeLinecap="round" 
                        className={progressPercent === 0 ? 'opacity-0' : 'opacity-100'}
                    />
                </svg>
                <div className="flex flex-col items-center justify-center pointer-events-none">
                    <motion.span 
                        key={progressPercent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-black text-5xl md:text-6xl tracking-tighter leading-none"
                    >
                        {progressPercent}%
                    </motion.span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.status}</span>
                </div>
            </div>

            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-[100px] animate-pulse"></div>
        </motion.div>

        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-2xl rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="flex flex-col gap-1">
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t.daftarAmalan}</h4>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{activeAmalan.length} {t.aktivatorTerdaftar}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsManaging(!isManaging)}
                    className={`group flex items-center justify-center gap-3 px-6 py-3.5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${isManaging ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95'}`}
                >
                    <Icon size={16}>{isManaging ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />}</Icon>
                    <span>{isManaging ? t.simpanPengaturan : t.aturAmalan}</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isManaging ? (
                    <motion.div 
                        key="management"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100 dark:border-emerald-800 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-xl flex-shrink-0">💡</div>
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed">
                                {t.personalisasiPesan}
                            </p>
                        </div>

                        {rizqGates.map(gate => {
                            const gateCustom = customAmalan.filter(ca => ca.gateId === gate.id);
                            const gateAmalan = [...gate.amalan, ...gateCustom];
                            
                            return (
                                <div key={gate.id} className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="w-8 h-8 rounded-[12px] bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                            {gate.emoji}
                                        </div>
                                        <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">{gate.name}</h5>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {gateAmalan.map(amal => {
                                            const isSelected = user.selectedAmalanIds.includes(amal.id);
                                            return (
                                                <motion.div 
                                                    key={amal.id}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleAmalanSelection(amal.id)}
                                                    className={`flex items-center justify-between p-4 rounded-[24px] border-2 cursor-pointer transition-all ${isSelected ? 'bg-white dark:bg-emerald-900/10 border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-none' : 'bg-transparent border-gray-100 dark:border-gray-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-gray-200'}`}
                                                >
                                                    <span className={`text-[11px] font-black uppercase tracking-tight leading-tight flex-1 pr-3 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                                        {amal.name}
                                                    </span>
                                                    <div className={`w-6 h-6 rounded-[10px] flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}>
                                                        {isSelected && <Icon size={14}><path d="M20 6 9 17l-5-5" /></Icon>}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {activeAmalan.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {activeAmalan.map((amal, index) => {
                                    const isCompleted = isAmalCompleted(amal.id, todayKey);
                                    const nextStreakReward = rewardsWithProgress
                                    .filter(r => r.type === 'streak' && r.amalId === amal.id && !user.earnedRewards.includes(r.id))
                                    .sort((a, b) => a.target - b.target)[0];

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={amal.id}
                                            onClick={() => toggleAmal(amal.id, todayKey)}
                                            className={`group relative overflow-hidden flex flex-col p-6 rounded-[32px] cursor-pointer transition-all duration-300 border-2 ${
                                            isCompleted 
                                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none' 
                                                : 'bg-white dark:bg-gray-800/50 border-gray-50 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xl'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-5 flex-1">
                                                    <div className={`w-12 h-12 rounded-[18px] flex-shrink-0 flex items-center justify-center border-2 transition-all duration-500 transform group-active:scale-90 ${isCompleted ? `bg-emerald-600 border-emerald-600 rotate-12 scale-110 shadow-2xl shadow-emerald-200` : `bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 group-hover:border-emerald-400 group-hover:rotate-6`}`}>
                                                        {isCompleted ? (
                                                            <Icon size={24} className="text-white"><path d="M20 6 9 17l-5-5" /></Icon>
                                                        ) : (
                                                            <span className="text-xs font-black text-gray-400 dark:text-gray-500 font-mono italic">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-black text-base md:text-xl transition-all duration-500 tracking-tight leading-tight ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{amal.name}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className={`px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest border transition-colors ${isCompleted ? 'bg-transparent border-gray-200 text-gray-400' : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'}`}>
                                                                {amal.gateEmoji} {amal.gateName}
                                                            </div>
                                                            {amal.isCustom && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-amber-500 rounded-full"></span> {t.custom}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`transition-all duration-500 transform ${isCompleted ? 'text-emerald-500 scale-125' : 'text-gray-100 dark:text-gray-700 opacity-50 group-hover:opacity-100'}`}>
                                                    <Icon size={32}><circle cx="12" cy="12" r="10"/></Icon>
                                                </div>
                                            </div>

                                            {nextStreakReward && !isCompleted && (
                                                <div className="mt-6 pl-16">
                                                    <div className="flex items-center justify-between text-[10px] font-black mb-2 text-gray-400 dark:text-gray-500">
                                                        <span className="uppercase tracking-[0.2em] italic">{t.todayRewardJourney}</span>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                                            <span>{nextStreakReward.current} / {nextStreakReward.target}</span>
                                                            <span className="animate-pulse">🔥</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${nextStreakReward.progress}%` }}
                                                            transition={{ duration: 1, ease: "circOut" }}
                                                            className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 h-full rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center text-center">
                                <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800/30 rounded-[48px] flex items-center justify-center text-7xl mb-8 shadow-inner border border-white dark:border-gray-800 relative group overflow-hidden">
                                     📭
                                     <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <h5 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t.sistemKosong}</h5>
                                <p className="text-gray-400 dark:text-gray-500 max-w-[320px] mt-3 font-bold leading-relaxed text-sm uppercase tracking-tight">
                                    {t.tekanAtur.split('{btn}')[0]}
                                    <span className="text-emerald-600 underline">{t.aturAmalan}</span>
                                    {t.tekanAtur.split('{btn}')[1]}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};
