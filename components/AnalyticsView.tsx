import React from 'react';
import { useRizqData } from '../hooks/useRizqData';
import { Icon } from './icons/Icon';
import { motion } from 'motion/react';
import { translations } from '../translations';

type AnalyticsViewProps = ReturnType<typeof useRizqData>;

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ getAnalyticsData, calculateOverallProgress, user }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const { dates, gateData } = getAnalyticsData();
  
  const overallHistory = dates.map(date => ({
    date,
    progress: calculateOverallProgress(date)
  }));

  const colorMap: { [key: string]: string } = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    teal: 'bg-teal-500',
    fuchsia: 'bg-fuchsia-500',
    slate: 'bg-slate-500',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Summary Card */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.analyticsTitle}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.analyticsSub}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
                        <Icon size={18} className="text-emerald-600"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></Icon>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{t.analytics7Days}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-3">
                        <div className="flex items-end gap-2 h-48 mb-4">
                            {overallHistory.map((item, idx) => (
                                <div key={item.date} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded mb-1 whitespace-nowrap z-20">
                                        {item.progress}% {t.analyticsProgress}
                                    </div>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(item.progress, 5)}%` }}
                                        transition={{ delay: idx * 0.1, duration: 1, ease: "easeOut" }}
                                        className={`w-full max-w-[40px] rounded-t-xl transition-colors ${item.progress > 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    ></motion.div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between px-2">
                             {dates.map(date => (
                                <div key={date} className="flex-1 text-center">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                        {new Date(date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                             ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 flex flex-col justify-center border border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">{t.analyticsWeeklyAvg}</p>
                        <h4 className="text-4xl font-black text-gray-900 dark:text-white text-center">
                            {Math.round(overallHistory.reduce((acc, curr) => acc + curr.progress, 0) / (dates.length || 1))}%
                        </h4>
                        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.round(overallHistory.reduce((acc, curr) => acc + curr.progress, 0) / (dates.length || 1))}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Gate Specific Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {gateData.map((gate, gIdx) => (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gIdx * 0.1 }}
                    key={gate.id} 
                    className="bg-white dark:bg-gray-800/40 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm group hover:shadow-md transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl transform group-hover:scale-110 transition-transform">{gate.emoji}</span>
                            <h4 className="font-bold text-gray-800 dark:text-white">{gate.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.analyticsAktivasiPintu}</span>
                    </div>

                    <div className="flex items-end gap-1.5 h-24">
                        {gate.progressHistory.map((h, idx) => (
                            <div key={h.date} className="flex-1 flex flex-col justify-end h-full">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(h.progress, 4)}%` }}
                                    transition={{ delay: (gIdx * 0.05) + (idx * 0.05), duration: 0.8 }}
                                    className={`w-full rounded-t-md transition-all ${h.progress > 0 ? colorMap[gate.color] || 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700 opacity-30'}`}
                                    title={`${h.progress}% - ${h.date}`}
                                ></motion.div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-0.5">
                         {dates.map((date, idx) => (
                            <div key={date} className="flex-1 text-center">
                                <span className={`text-[8px] font-bold ${idx === dates.length - 1 ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {new Date(date).getDate()}
                                </span>
                            </div>
                         ))}
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
};

export default AnalyticsView;