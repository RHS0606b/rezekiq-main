import React from 'react';
import { Challenge, User, Reward, RizqGate } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface ChallengesViewProps {
  allChallenges: Challenge[];
  user: User;
  startChallenge: (challengeId: string) => void;
  cancelChallenge: (challengeId: string) => void;
  allRewards: Reward[];
  rizqGates: RizqGate[];
}

const ChallengeCard: React.FC<{
  challenge: Challenge;
  userChallenge?: User['challenges'][0];
  onStart: () => void;
  onCancel: () => void;
  reward?: Reward;
  gate?: RizqGate;
  language?: 'id' | 'en';
}> = ({ challenge, userChallenge, onStart, onCancel, reward, gate, language = 'id' }) => {
  const t = translations[language];
  const status = userChallenge?.status;
  const progressDays = userChallenge ? Object.keys(userChallenge.progress).length : 0;
  const progressPercentage = (progressDays / challenge.durationDays) * 100;

  const color = gate?.color || 'emerald';
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-600 to-teal-500',
    sky: 'from-sky-600 to-indigo-500',
    amber: 'from-amber-500 to-orange-500',
    indigo: 'from-indigo-600 to-purple-500',
    rose: 'from-rose-600 to-pink-500',
    teal: 'from-teal-600 to-emerald-500',
    fuchsia: 'from-fuchsia-600 to-pink-500',
    slate: 'from-slate-600 to-gray-500',
  };

  const gradient = colorMap[color] || colorMap.emerald;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-full -mr-16 -mt-16 blur-2xl group-hover:opacity-[0.08] transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start gap-4 mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{gate?.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{gate?.name}</span>
                </div>
                <h4 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{challenge.name}</h4>
            </div>
            {status === 'active' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-full border border-sky-100 dark:border-sky-800 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">{t.challengesActiveLabel}</span>
                </div>
            )}
            {status === 'completed' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <Icon size={12} className="text-emerald-500"><path d="M20 6 9 17l-5-5" /></Icon>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t.challengesCompleted}</span>
                </div>
            )}
             {status === 'failed' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 rounded-full border border-rose-100 dark:border-rose-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">{t.challengesFailed}</span>
                </div>
            )}
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 drop-shadow-sm">{challenge.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.challengesDuration}</p>
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></Icon>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{challenge.durationDays} {t.hari}</span>
                </div>
            </div>
            {reward && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.challengesReward}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{reward.icon}</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{reward.name}</span>
                    </div>
                </div>
            )}
        </div>

        {status === 'active' && (
          <div className="space-y-4">
            <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>{t.challengesProgressDay}</span>
                    <span className="text-gray-600 dark:text-gray-200">{progressDays} / {challenge.durationDays}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`h-1 rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
                  ></motion.div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: challenge.durationDays }).map((_, index) => {
                    const isDayComplete = index < progressDays;
                    return (
                        <div 
                            key={index}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ring-2 ring-offset-2 ring-transparent ${
                                isDayComplete 
                                    ? `bg-gradient-to-br ${gradient} text-white shadow-sm ring-emerald-500/20` 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}
                        >
                            {isDayComplete ? (
                                <Icon size={12}><path d="M20 6 9 17l-5-5" /></Icon>
                            ) : (
                                <span className="text-[8px] font-bold">{index + 1}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                onClick={onCancel}
                className="w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-white border-2 border-rose-100 dark:border-rose-900/30 hover:bg-rose-500 rounded-2xl transition-all duration-300 active:scale-95"
            >
                {t.challengesCancel}
            </button>
          </div>
        )}

        <div className="mt-2">
            {!status && (
                <button
                    onClick={onStart}
                    className={`w-full py-3.5 bg-gradient-to-r ${gradient} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 dark:shadow-none hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn`}
                >
                    <span>{t.challengesStart}</span>
                    <Icon size={16} className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7"/></Icon>
                </button>
            )}
            {status === 'completed' && (
                <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t.challengesSuccessMsg}</p>
                </div>
            )}
            {status === 'failed' && (
                <button
                    onClick={onStart}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    {t.challengesRetry}
                </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export const ChallengesView: React.FC<ChallengesViewProps> = ({ allChallenges, user, startChallenge, cancelChallenge, allRewards, rizqGates }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const userChallengesById = Object.fromEntries((user?.challenges || []).map(uc => [uc.challengeId, uc]));
  
  const activeChallenges = allChallenges.filter(c => userChallengesById[c.id]?.status === 'active');
  const availableChallenges = allChallenges.filter(c => !userChallengesById[c.id] || userChallengesById[c.id]?.status === 'failed');
  const completedChallenges = allChallenges.filter(c => userChallengesById[c.id]?.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t.challengesTitle}</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.challengesSub}</p>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t.totalSelesai}</p>
                  <p className="text-xl font-black text-emerald-600 leading-none">{completedChallenges.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                  <Icon size={24}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Icon>
              </div>
          </div>
      </div>

      <AnimatePresence mode="popLayout">
        {activeChallenges.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.challengesActive}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeChallenges.map(challenge => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        userChallenge={userChallengesById[challenge.id]}
                        onStart={() => {}}
                        onCancel={() => cancelChallenge(challenge.id)}
                        reward={allRewards.find(r => r.id === challenge.rewardId)}
                        gate={rizqGates.find(g => g.id === challenge.gateId)}
                        language={language}
                    />
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.challengesAvailable}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableChallenges.map(challenge => (
            <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userChallenge={userChallengesById[challenge.id]}
                onStart={() => startChallenge(challenge.id)}
                onCancel={() => {}}
                reward={allRewards.find(r => r.id === challenge.rewardId)}
                gate={rizqGates.find(g => g.id === challenge.gateId)}
                language={language}
            />
        ))}
        </div>
      </div>
      
      {completedChallenges.length > 0 && (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-6 bg-gray-400 rounded-full"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.challengesWallOfFame}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
            {completedChallenges.map(challenge => (
                <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={userChallengesById[challenge.id]}
                    onStart={() => {}}
                    onCancel={() => {}}
                    reward={allRewards.find(r => r.id === challenge.rewardId)}
                    gate={rizqGates.find(g => g.id === challenge.gateId)}
                    language={language}
                />
            ))}
            </div>
        </div>
      )}
    </div>
  );
};