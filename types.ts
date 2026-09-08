export interface Amal {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
}

export interface SkillBooster {
  title: string;
  description: string;
}

export interface RizqGate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  dalil: string;
  kisah: string;
  color: string;
  amalan: Amal[];
  dos: string[];
  donts: string[];
  skillBooster: SkillBooster[];
  reflectionPrompt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type AmalLog = {
  [date: string]: {
    [amalId: string]: boolean;
  };
};

export interface CustomAmal {
  id: string;
  name: string;
  description?: string;
  gateId: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'milestone' | 'challenge';
  amalId?: string; // For streak rewards
  gateId?: string; // For gate completion rewards
  target: number;
}

export interface RewardWithProgress extends Reward {
  progress: number;
  current: number;
}


export interface NotificationSettings {
  enabled: boolean;
  time: string; // e.g., "17:00"
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  rewardId: string;
  amalIds: string[];
  gateId: string;
}

export interface UserChallenge {
  challengeId: string;
  startDate: string; // ISO date string YYYY-MM-DD
  status: 'active' | 'completed' | 'failed';
  progress: { [date: string]: boolean }; // e.g., { '2023-10-27': true }
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  niat: string;
  phoneNumber?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  spiritualGoal?: string;
  preferredRecitation?: string;
  avatar?: string;
  residence?: string;
  profession?: string;
  language: 'id' | 'en';
  earnedRewards: string[];
  notificationSettings: NotificationSettings;
  challenges: UserChallenge[];
  soundEffectsEnabled: boolean;
  selectedAmalanIds: string[];
}

export type Theme = 'light' | 'dark';

export type View = 
  | { type: 'landing' }
  | { type: 'auth'; mode: 'login' | 'register' }
  | { type: 'dashboard' } 
  | { type: 'gate'; id: string } 
  | { type: 'today' } 
  | { type: 'journal' } 
  | { type: 'analytics' } 
  | { type: 'ai-coach' }
  | { type: 'profile' }
  | { type: 'rewards' }
  | { type: 'settings' }
  | { type: 'challenges' };

export type SoundType = 'complete' | 'reward' | 'send' | 'click' | 'start' | 'celebrate';