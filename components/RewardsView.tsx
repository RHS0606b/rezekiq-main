import React from 'react';
import { RewardWithProgress, User } from '../types';
import { translations } from '../translations';

interface RewardsViewProps {
  rewardsWithProgress: RewardWithProgress[];
  user: User;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
    <div 
      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const RewardCard: React.FC<{ reward: RewardWithProgress }> = ({ reward }) => {
  const isEarned = reward.progress >= 100;

  return (
    <div className={`p-4 rounded-xl border-2 flex items-start gap-4 transition-all duration-300 ${isEarned ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className={`text-4xl transition-transform duration-300 pt-1 ${isEarned ? 'transform scale-110' : 'grayscale'}`}>
        {reward.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
            <div>
                <h4 className={`font-semibold ${isEarned ? 'text-amber-800 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {reward.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
            </div>
             {isEarned ? (
                <div className="text-2xl">🏆</div>
             ) : (
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">{reward.current}/{reward.target}</div>
             )}
        </div>
        {!isEarned && (
          <ProgressBar progress={reward.progress} />
        )}
      </div>
    </div>
  );
};


export const RewardsView: React.FC<RewardsViewProps> = ({ rewardsWithProgress, user }) => {
    const earnedCount = rewardsWithProgress.filter(r => r.progress >= 100).length;
    const language = user?.language || 'id';
    const t = translations[language];
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 text-center">
                 <h3 className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">{t.rewardsTitle}</h3>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t.rewardsProgressMsg.replace('{earned}', earnedCount.toString()).replace('{total}', rewardsWithProgress.length.toString())} {t.rewardsSub}
                 </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewardsWithProgress.map(reward => (
                    <RewardCard 
                        key={reward.id}
                        reward={reward}
                    />
                ))}
            </div>
        </div>
    );
};