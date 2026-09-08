import React from 'react';
import { RizqGate } from '../types';
import { motion } from 'motion/react';
import { translations } from '../translations';

interface GateCardProps {
  gate: RizqGate;
  onSelectGate: (gateId: string) => void;
  progress: number;
  language: 'id' | 'en';
}

const GateCard: React.FC<GateCardProps> = ({ gate, onSelectGate, progress, language }) => {
  const t = translations[language || 'id'];
  const colorVariants = {
    emerald: 'from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800 border-emerald-100 dark:border-emerald-800/50',
    sky: 'from-sky-50 to-white dark:from-sky-900/10 dark:to-gray-800 border-sky-100 dark:border-sky-800/50',
    amber: 'from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800 border-amber-100 dark:border-amber-800/50',
    indigo: 'from-indigo-50 to-white dark:from-indigo-900/10 dark:to-gray-800 border-indigo-100 dark:border-indigo-800/50',
    rose: 'from-rose-50 to-white dark:from-rose-900/10 dark:to-gray-800 border-rose-100 dark:border-rose-800/50',
    teal: 'from-teal-50 to-white dark:from-teal-900/10 dark:to-gray-800 border-teal-100 dark:border-teal-800/50',
    fuchsia: 'from-fuchsia-50 to-white dark:from-fuchsia-900/10 dark:to-gray-800 border-fuchsia-100 dark:border-fuchsia-800/50',
    slate: 'from-slate-50 to-white dark:from-slate-900/10 dark:to-gray-800 border-slate-100 dark:border-slate-800/50',
  };

  const accentColors = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-500',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-500',
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-500',
    fuchsia: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500',
    slate: 'text-slate-600 dark:text-slate-400 bg-slate-500',
  }

  const colorKey = gate.color as keyof typeof colorVariants;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelectGate(gate.id)}
      className={`group relative p-6 rounded-[32px] border bg-gradient-to-br shadow-sm hover:shadow-2xl hover:shadow-emerald-200/40 dark:hover:shadow-none cursor-pointer transition-all duration-300 overflow-hidden ${colorVariants[colorKey]}`}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6">
            <div className="text-6xl transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 drop-shadow-sm">{gate.emoji}</div>
            <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xl ring-4 ring-white dark:ring-gray-800 ${accentColors[colorKey].split(' ')[2]}`}>
                {progress}%
            </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-black tracking-tight text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase leading-none">{gate.name}</h3>
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 dark:text-gray-500 mt-2">{t.gateLabel} {gate.id}</p>
        </div>
        
        <div className="mt-8 w-full max-w-[140px]">
            <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden p-[2px]">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full rounded-full ${accentColors[colorKey].split(' ')[2]}`}
                ></motion.div>
            </div>
        </div>
      </div>

      {/* Decorative background accent */}
      <div className={`absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${accentColors[colorKey].split(' ')[2]}`}></div>
    </motion.div>
  );
};

export default GateCard;