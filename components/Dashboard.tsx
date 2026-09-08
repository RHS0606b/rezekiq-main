import React from 'react';
import { RizqGate } from '../types';
import GateCard from './GateCard';
import { Icon } from './icons/Icon';
import { motion } from 'motion/react';
import { translations } from '../translations';

interface DashboardProps {
  gates: RizqGate[];
  onSelectGate: (gateId: string) => void;
  getGateProgress: (gate: RizqGate) => number;
  overallProgress: number;
  language: 'id' | 'en';
}

export const Dashboard: React.FC<DashboardProps> = ({ gates, onSelectGate, getGateProgress, overallProgress, language }) => {
  const t = translations[language || 'id'];
  return (
    <div className="space-y-12 pb-20">
      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-8 md:p-14 text-white shadow-2xl shadow-emerald-200 dark:shadow-none"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            >
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                {t.dashboardSystemActivated}
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight uppercase italic drop-shadow-lg">
                {t.dashboardHeroTitle1} <br className="hidden md:block" /> {t.dashboardHeroTitle2} <span className="text-emerald-300">{t.dashboardHeroTitle3}</span>
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t.dashboardHeroDesc}
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
               <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/10 flex items-center gap-4 min-w-[160px]">
                  <div className="bg-emerald-500/30 p-3 rounded-2xl">
                      <Icon size={24}><path d="M12 2v20M2 12h20" /></Icon>
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{t.dashboardAktivasi}</p>
                      <p className="text-2xl font-black tracking-tighter">{overallProgress}%</p>
                  </div>
               </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/10 flex items-center gap-4 min-w-[160px]">
                   <div className="bg-emerald-500/30 p-3 rounded-2xl">
                       <Icon size={24}><path d="M9 12l2 2 4-4" /></Icon>
                   </div>
                   <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{t.dashboardMood}</p>
                       <p className="text-2xl font-black tracking-tighter">{t.dashboardMoodStatus}</p>
                   </div>
                </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56 md:w-72 md:h-72">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-2xl" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 263.9 }}
                  animate={{ strokeDashoffset: overallProgress === 0 ? 263.9 : 263.9 - (263.9 * overallProgress) / 100 }}
                  transition={{ duration: 2, ease: "circOut" }}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray="263.9"
                  strokeLinecap="round"
                  className={overallProgress === 0 ? 'opacity-0' : 'opacity-100'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.span 
                    key={overallProgress}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl md:text-7xl font-black tracking-tighter leading-none"
                >
                    {overallProgress}%
                </motion.span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mt-2">{t.dashboardProgressTotal}</span>
              </div>
            </div>
            
            {/* Visual pulse for center circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 bg-white/5 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes for background */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-teal-400/20 rounded-full blur-[100px] [animation-delay:2s]"></div>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
        <div className="flex flex-col">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                {t.dashboardPintuRezeki}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.2em] mt-2 ml-5">{t.dashboardPintuRezekiDesc}</p>
        </div>
        <div className="flex gap-2">
            <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {t.dashboardPilihPintu}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
        {gates.map((gate, idx) => (
          <motion.div
            key={gate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <GateCard 
                gate={gate} 
                onSelectGate={onSelectGate}
                progress={getGateProgress(gate)}
                language={language}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};