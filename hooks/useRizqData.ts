import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RizqGate, AmalLog, JournalEntry, Theme, CustomAmal, User, RewardWithProgress, Challenge, UserChallenge } from '../types';
import { getRizqGatesData, getAllRewards, getAllChallenges } from '../constants';
import { apiService } from '../services/apiService';

const todayKey = () => new Date().toISOString().slice(0, 10);

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } 
  catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
};

interface UserRegistryEntry {
    id: string;
    email: string;
    password?: string;
    name: string;
    gender: 'Laki-laki' | 'Perempuan';
    phoneNumber?: string;
}

interface UserData {
    amalLog: AmalLog;
    journal: JournalEntry[];
    customAmalan: CustomAmal[];
    user: User;
    theme: Theme;
}

const DEFAULT_USER_DATA = (name: string, email: string, gender: 'Laki-laki' | 'Perempuan', phoneNumber: string = '', id: string): UserData => ({
    amalLog: {},
    journal: [],
    customAmalan: [],
    theme: 'light',
    user: {
        id,
        name,
        email,
        niat: 'Mencari ridha Allah dan keberkahan dalam rezeki.',
        phoneNumber,
        gender,
        spiritualGoal: '',
        preferredRecitation: '',
        avatar: '',
        language: 'id',
        earnedRewards: [],
        notificationSettings: {
            enabled: false,
            time: '17:00',
        },
        challenges: [],
        soundEffectsEnabled: true,
        selectedAmalanIds: getRizqGatesData('id').flatMap(g => g.amalan.map(a => a.id)),
    }
});

// Seed data for demo account
const SEED_DEMO_DATA = (id: string): UserData => {
    const demo = DEFAULT_USER_DATA('Akun Demo', 'akundemo@rezekiq.id', 'Laki-laki', '08123456789', id);
    const today = todayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Some checklist done
    demo.amalLog = {
        [today]: {
            'syukur-1': true,
            'syukur-2': true,
            'usaha-1': true
        },
        [yesterdayKey]: {
            'syukur-1': true,
            'syukur-2': true,
            'syukur-3': true,
            'usaha-1': true,
            'usaha-2': true
        }
    };

    // Some journal
    demo.journal = [
        { id: 'j1', date: today, content: 'Alhamdulillah hari ini mendapatkan kabar baik.' },
        { id: 'j2', date: yesterdayKey, content: 'Terima kasih Yaa Allah atas nikmat sehat hari ini.' }
    ];

    // Some rewards
    demo.user.earnedRewards = ['syukur_completion', 'first_journal'];
    
    return demo;
};

export const useRizqData = () => {
  // Lang state for early initialization
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    const saved = localStorage.getItem('rezekiq_current_user_id');
    if (saved) {
        const data = loadFromStorage<any>(`rezekiq_data_${saved}`, null);
        return data?.user?.language || 'id';
    }
    return 'id';
  });

  const rizqGates = useMemo(() => getRizqGatesData(lang), [lang]);
  const allRewards = useMemo(() => getAllRewards(lang), [lang]);
  const allChallenges = useMemo(() => getAllChallenges(lang), [lang]);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadFromStorage<string | null>('rezekiq_current_user_id', null));
  const [userRegistry, setUserRegistry] = useState<UserRegistryEntry[]>(() => loadFromStorage<UserRegistryEntry[]>('rezekiq_user_registry', []));

  const [globalTheme, setGlobalTheme] = useState<Theme>(() => loadFromStorage<Theme>('rezekiq_global_theme', 'light'));
  const [guestUser, setGuestUser] = useState<User>(() => DEFAULT_USER_DATA('Guest', '', 'Laki-laki', '', 'guest').user);

  // Cloud Sync states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => loadFromStorage<string | null>('rezekiq_last_synced_at', null));
  const syncTimerRef = useRef<any>(null);

  // Initialize Demo Account in local registry if not exists
  useEffect(() => {
    const demoEmail = 'akundemo@rezekiq.id';
    const hasDemo = userRegistry.some(u => u.email === demoEmail);
    if (!hasDemo) {
        const demoId = 'demo-user-123';
        const demoEntry: UserRegistryEntry = {
            id: demoId,
            email: demoEmail,
            password: 'password123',
            name: 'Akun Demo',
            gender: 'Laki-laki',
            phoneNumber: '08123456789'
        };
        const newRegistry = [...userRegistry, demoEntry];
        setUserRegistry(newRegistry);
        saveToStorage('rezekiq_user_registry', newRegistry);
        saveToStorage(`rezekiq_data_${demoId}`, SEED_DEMO_DATA(demoId));
    }
  }, [userRegistry]);

  const [userData, setUserData] = useState<UserData | null>(() => {
    if (currentUserId) {
        const data = loadFromStorage<UserData | null>(`rezekiq_data_${currentUserId}`, null);
        if (data && data.user) {
            return data;
        }
    }
    return null;
  });

  // On mount: Try verifying session or syncing latest cloud data if authenticated
  useEffect(() => {
    let isMounted = true;
    const initSync = async () => {
      const token = apiService.getToken();
      if (!token) return;

      try {
        setSyncStatus('syncing');
        const session = await apiService.getMe();
        if (!isMounted) return;

        if (session && session.data) {
          setUserData(prev => {
            const merged = {
              ...session.data,
              theme: globalTheme
            };
            return merged;
          });
          if (session.user) {
            setCurrentUserId(session.user.id);
            setLang(session.user.language || 'id');
            saveToStorage(`rezekiq_data_${session.user.id}`, session.data);
          }
          setSyncStatus('synced');
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSyncedAt(timeStr);
          saveToStorage('rezekiq_last_synced_at', timeStr);
        } else {
          setSyncStatus('offline');
        }
      } catch (err) {
        console.warn('Initial cloud sync check failed, using local cache:', err);
        if (isMounted) setSyncStatus('offline');
      }
    };

    initSync();
    return () => { isMounted = false; };
  }, []);

  const { amalLog, journal, customAmalan, user, theme } = useMemo(() => {
    if (userData) return { ...userData, theme: globalTheme };
    return {
        amalLog: {},
        journal: [],
        customAmalan: [],
        theme: globalTheme,
        user: guestUser
    };
  }, [userData, globalTheme, guestUser]);

  const setAmalLog = useCallback((updater: AmalLog | ((prev: AmalLog) => AmalLog)) => {
    setUserData(prev => prev ? { ...prev, amalLog: typeof updater === 'function' ? updater(prev.amalLog) : updater } : null);
  }, []);

  const setJournal = useCallback((updater: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => {
    setUserData(prev => prev ? { ...prev, journal: typeof updater === 'function' ? updater(prev.journal) : updater } : null);
  }, []);

  const setCustomAmalan = useCallback((updater: CustomAmal[] | ((prev: CustomAmal[]) => CustomAmal[])) => {
    setUserData(prev => prev ? { ...prev, customAmalan: typeof updater === 'function' ? updater(prev.customAmalan) : updater } : null);
  }, []);

  const setTheme = useCallback((updater: Theme | ((prev: Theme) => Theme)) => {
    setGlobalTheme(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveToStorage('rezekiq_global_theme', next);
        return next;
    });
    setUserData(prev => prev ? { ...prev, theme: typeof updater === 'function' ? updater(prev.theme) : updater } : null);
  }, []);

  const setUser = useCallback((updater: User | ((prev: User) => User)) => {
    if (userData) {
        setUserData(prev => {
            if (!prev) return null;
            const nextUser = typeof updater === 'function' ? updater(prev.user) : updater;
            if (nextUser.language !== prev.user.language) {
                setLang(nextUser.language);
            }
            return { ...prev, user: nextUser };
        });
    } else {
        setGuestUser(prev => {
            const nextUser = typeof updater === 'function' ? updater(prev) : updater;
            if (nextUser.language !== prev.language) {
                setLang(nextUser.language);
            }
            return nextUser;
        });
    }
  }, [userData]);

  // Sync guest user language for UI
  useEffect(() => {
    if (!userData) {
        saveToStorage('rezekiq_guest_user', guestUser);
    }
  }, [guestUser, userData]);

  // Persistence: Immediate Local Save + Debounced Cloud Auto-Sync
  useEffect(() => {
    if (!currentUserId || !userData) return;
    
    // 1. Instant local persistence
    saveToStorage(`rezekiq_data_${currentUserId}`, { ...userData, theme: globalTheme });

    // 2. Debounced push to cloud
    if (currentUserId === 'guest') return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        if (!apiService.getToken()) {
          setSyncStatus('offline');
          return;
        }
        setSyncStatus('syncing');
        await apiService.pushCloudData({ ...userData, theme: globalTheme });
        setSyncStatus('synced');
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        saveToStorage('rezekiq_last_synced_at', nowStr);
      } catch (err) {
        console.warn('Auto cloud sync notice (progress remains saved locally):', err);
        setSyncStatus('offline');
      }
    }, 1500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [userData, currentUserId, globalTheme]);

  useEffect(() => {
    saveToStorage('rezekiq_current_user_id', currentUserId);
  }, [currentUserId]);

  const register = useCallback(async (data: UserRegistryEntry & { passwordConfirm?: string }) => {
    try {
      // 1. Attempt Cloud Registration
      const cloudRes = await apiService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        initialData: userData || undefined
      });

      if (cloudRes && cloudRes.user) {
        const newUserEntry: UserRegistryEntry = {
          id: cloudRes.user.id,
          email: cloudRes.user.email,
          name: cloudRes.user.name,
          gender: cloudRes.user.gender || 'Laki-laki',
          phoneNumber: cloudRes.user.phoneNumber
        };

        const newRegistry = [...userRegistry.filter(u => u.email !== data.email), newUserEntry];
        setUserRegistry(newRegistry);
        saveToStorage('rezekiq_user_registry', newRegistry);
        saveToStorage(`rezekiq_data_${newUserEntry.id}`, cloudRes.data);

        setCurrentUserId(newUserEntry.id);
        setUserData(cloudRes.data);
        setSyncStatus('synced');
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        saveToStorage('rezekiq_last_synced_at', nowStr);
        return cloudRes.user;
      }
    } catch (cloudErr: any) {
      if (cloudErr.message && cloudErr.message.includes('Email sudah terdaftar')) {
        throw cloudErr;
      }
      console.warn('Backend registration offline, falling back to local registry:', cloudErr);
    }

    // 2. Fallback to local registration if cloud server is unavailable
    if (userRegistry.some(u => u.email === data.email)) {
      throw new Error('Email sudah terdaftar secara lokal');
    }
    const newUserEntry: UserRegistryEntry = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      gender: data.gender,
      phoneNumber: data.phoneNumber
    };
    const newRegistry = [...userRegistry, newUserEntry];
    setUserRegistry(newRegistry);
    saveToStorage('rezekiq_user_registry', newRegistry);
    const defaultData = DEFAULT_USER_DATA(data.name, data.email, data.gender, data.phoneNumber, newUserEntry.id);
    saveToStorage(`rezekiq_data_${newUserEntry.id}`, defaultData);
    
    setCurrentUserId(newUserEntry.id);
    setUserData(defaultData);
    setSyncStatus('offline');
    return newUserEntry;
  }, [userRegistry, userData]);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      // 1. Attempt Cloud Login
      const cloudRes = await apiService.login(email, password);
      if (cloudRes && cloudRes.user) {
        const userEntry: UserRegistryEntry = {
          id: cloudRes.user.id,
          email: cloudRes.user.email,
          name: cloudRes.user.name,
          gender: cloudRes.user.gender || 'Laki-laki',
          phoneNumber: cloudRes.user.phoneNumber
        };

        const newRegistry = [...userRegistry.filter(u => u.email !== email), userEntry];
        setUserRegistry(newRegistry);
        saveToStorage('rezekiq_user_registry', newRegistry);
        
        const loadedData = cloudRes.data || DEFAULT_USER_DATA(userEntry.name, userEntry.email, userEntry.gender, userEntry.phoneNumber, userEntry.id);
        saveToStorage(`rezekiq_data_${userEntry.id}`, loadedData);

        setCurrentUserId(userEntry.id);
        setUserData(loadedData);
        setLang(cloudRes.user.language || 'id');
        setSyncStatus('synced');
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        saveToStorage('rezekiq_last_synced_at', nowStr);
        return cloudRes.user;
      }
    } catch (cloudErr: any) {
      if (cloudErr.message && cloudErr.message.includes('Email atau password salah')) {
        throw cloudErr;
      }
      console.warn('Backend login unavailable, checking local registry:', cloudErr);
    }

    // 2. Offline Fallback to Local Registry
    const userEntry = userRegistry.find(u => u.email === email && (!password || u.password === password));
    if (!userEntry) {
      throw new Error('Email atau password salah');
    }
    const data = loadFromStorage<UserData>(`rezekiq_data_${userEntry.id}`, DEFAULT_USER_DATA(userEntry.name, userEntry.email, userEntry.gender, userEntry.phoneNumber, userEntry.id));
    setCurrentUserId(userEntry.id);
    setUserData(data);
    setLang(data.user.language || 'id');
    setSyncStatus('offline');
    return userEntry;
  }, [userRegistry]);

  const logout = useCallback(() => {
    apiService.logout();
    setCurrentUserId(null);
    setUserData(null);
    setSyncStatus('idle');
  }, []);

  const syncWithCloud = useCallback(async () => {
    if (!userData || !currentUserId || currentUserId === 'guest') {
      return false;
    }
    try {
      setSyncStatus('syncing');
      const updated = await apiService.pushCloudData({ ...userData, theme: globalTheme });
      if (updated) {
        setUserData(updated);
        saveToStorage(`rezekiq_data_${currentUserId}`, updated);
      }
      setSyncStatus('synced');
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(nowStr);
      saveToStorage('rezekiq_last_synced_at', nowStr);
      return true;
    } catch (err: any) {
      console.error('Manual sync failed:', err);
      setSyncStatus('offline');
      throw err;
    }
  }, [userData, currentUserId, globalTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  // Rest of the logic adapted to use userData...
  const isAmalCompleted = useCallback((amalId: string, date: string) => {
    return amalLog[date]?.[amalId] ?? false;
  }, [amalLog]);

  const calculateStreak = useCallback((amalId: string) => {
    let streak = 0;
    const d = new Date();
    if (!isAmalCompleted(amalId, d.toISOString().slice(0, 10))) {
        d.setDate(d.getDate() - 1);
    }
    
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (isAmalCompleted(amalId, key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [isAmalCompleted]);

  useEffect(() => {
    if (!userData) return;
    
    const checkAndGrantRewards = () => {
        const newRewards: string[] = [];
        const today = todayKey();
        
        allRewards.forEach(reward => {
            if (user.earnedRewards.includes(reward.id)) return;

            if (reward.type === 'streak' && reward.amalId) {
                if (calculateStreak(reward.amalId) >= reward.target) {
                    newRewards.push(reward.id);
                }
            } else if (reward.type === 'milestone') {
                 if (reward.id === 'first_journal' || reward.id === 'journal_10_entries') {
                    if (journal.length >= reward.target) {
                        newRewards.push(reward.id);
                    }
                } else if (reward.id === 'first_custom_amal') {
                    if (customAmalan.length >= reward.target) {
                        newRewards.push(reward.id);
                    }
                }
            } else if (reward.type === 'completion') {
                let completedCount = 0;
                if (reward.gateId) {
                    const gate = rizqGates.find(g => g.id === reward.gateId);
                    if (gate) {
                        completedCount = gate.amalan.filter(a => isAmalCompleted(a.id, today)).length;
                    }
                } else if (reward.id === 'perfect_day') {
                    completedCount = rizqGates.flatMap(g => g.amalan).filter(a => isAmalCompleted(a.id, today)).length;
                } else if (reward.id === 'aktivator_8_pintu') {
                    const activatedGates = new Set();
                    rizqGates.forEach(gate => {
                        const completedInGate = gate.amalan.some(a => isAmalCompleted(a.id, today));
                        if(completedInGate) {
                            activatedGates.add(gate.id);
                        }
                    });
                    completedCount = activatedGates.size;
                }

                if (completedCount >= reward.target) {
                    newRewards.push(reward.id);
                }
            }
        });

        if (newRewards.length > 0) {
            setUser(prevUser => ({
                ...prevUser,
                earnedRewards: [...new Set([...prevUser.earnedRewards, ...newRewards])]
            }));
        }
    };
    
    const updateChallengeProgress = () => {
        const today = todayKey();
        let challengesUpdated = false;
        const updatedChallenges = user.challenges.map(uc => {
            if (uc.status !== 'active') return uc;
            const challenge = allChallenges.find(c => c.id === uc.challengeId);
            if (!challenge) return uc;

            if (!uc.progress[today]) {
                const allAmalForTodayCompleted = challenge.amalIds.every(amalId => isAmalCompleted(amalId, today));
                if (allAmalForTodayCompleted) {
                    uc.progress[today] = true;
                    challengesUpdated = true;
                }
            }
            
            const completedDays = Object.keys(uc.progress).length;
            if (completedDays >= challenge.durationDays) {
                uc.status = 'completed';
                challengesUpdated = true;
                setUser(prev => ({...prev, earnedRewards: [...new Set([...prev.earnedRewards, challenge.rewardId])]}));
            }
            else {
                const startDate = new Date(uc.startDate);
                const elapsedDays = (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                if (elapsedDays > challenge.durationDays) {
                    uc.status = 'failed';
                    challengesUpdated = true;
                }
            }
            return uc;
        });

        if (challengesUpdated) {
            setUser(prev => ({ ...prev, challenges: updatedChallenges }));
        }
    };

    checkAndGrantRewards();
    updateChallengeProgress();
  }, [amalLog, journal.length, customAmalan.length, user.challenges, user.earnedRewards, rizqGates, allRewards, calculateStreak, isAmalCompleted, allChallenges, userData, setUser]);

  const getRewardsWithProgress = useCallback((): RewardWithProgress[] => {
    const date = todayKey();
    return allRewards.map(reward => {
        let current = 0;
        if (user.earnedRewards.includes(reward.id)) {
            current = reward.target;
        } else {
            switch (reward.type) {
                case 'streak': current = reward.amalId ? calculateStreak(reward.amalId) : 0; break;
                case 'completion':
                     if (reward.gateId) {
                        const gate = rizqGates.find(g => g.id === reward.gateId);
                        current = gate ? gate.amalan.filter(a => isAmalCompleted(a.id, date)).length : 0;
                    } else if (reward.id === 'perfect_day') {
                        current = rizqGates.flatMap(g => g.amalan).filter(a => isAmalCompleted(a.id, date)).length;
                    } else if (reward.id === 'aktivator_8_pintu') {
                        const activatedGates = new Set();
                        rizqGates.forEach(gate => { if (gate.amalan.some(a => isAmalCompleted(a.id, date))) activatedGates.add(gate.id); });
                        current = activatedGates.size;
                    }
                    break;
                case 'milestone':
                    if (reward.id === 'first_journal' || reward.id === 'journal_10_entries') current = Math.min(journal.length, reward.target);
                    else if (reward.id === 'first_custom_amal') current = Math.min(customAmalan.length, reward.target);
                    break;
                case 'challenge':
                     const challengeReward = allChallenges.find(c => c.rewardId === reward.id);
                     if (challengeReward) {
                        const userChallenge = user.challenges.find(uc => uc.challengeId === challengeReward.id && uc.status === 'completed');
                        if (userChallenge) current = 1;
                     }
                    break;
            }
        }
        const progress = reward.target > 0 ? Math.min(Math.round((current / reward.target) * 100), 100) : 0;
        return { ...reward, current, progress };
    });
  }, [allRewards, user.earnedRewards, user.challenges, calculateStreak, rizqGates, isAmalCompleted, journal, customAmalan.length, allChallenges]);

  const toggleAmal = useCallback((amalId: string, date: string) => {
    setAmalLog(prevLog => ({
      ...prevLog,
      [date]: { ...(prevLog[date] || {}), [amalId]: !(prevLog[date]?.[amalId] ?? false) },
    }));
  }, [setAmalLog]);

  const calculateGateProgress = useCallback((gate: RizqGate, date: string) => {
    const customForGate = customAmalan.filter(a => a.gateId === gate.id);
    const totalAmalan = gate.amalan.length + customForGate.length;
    if (totalAmalan === 0) return 100;
    const completedPredefined = gate.amalan.filter(amal => isAmalCompleted(amal.id, date)).length;
    const completedCustom = customForGate.filter(amal => isAmalCompleted(amal.id, date)).length;
    return Math.round(((completedPredefined + completedCustom) / totalAmalan) * 100);
  }, [isAmalCompleted, customAmalan]);
  
  const calculateOverallProgress = useCallback((date: string) => {
    const allPredefinedAmalan = rizqGates.flatMap(g => g.amalan);
    const totalAmalan = allPredefinedAmalan.length + customAmalan.length;
    if (totalAmalan === 0) return 0;
    const completedPredefined = allPredefinedAmalan.filter(amal => isAmalCompleted(amal.id, date)).length;
    const completedCustom = customAmalan.filter(amal => isAmalCompleted(amal.id, date)).length;
    return Math.round(((completedPredefined + completedCustom) / totalAmalan) * 100);
  }, [rizqGates, customAmalan, isAmalCompleted]);

  const addJournalEntry = useCallback((content: string) => {
    if (!content.trim()) return;
    setJournal(prev => [{ id: Math.random().toString(36).substr(2, 9), date: todayKey(), content: content.trim() }, ...prev]);
  }, [setJournal]);

  const editJournalEntry = useCallback((id: string, content: string) => {
    if (!content.trim()) return;
    setJournal(prev => prev.map(e => e.id === id ? { ...e, content: content.trim() } : e));
  }, [setJournal]);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournal(prev => prev.filter(e => e.id !== id));
  }, [setJournal]);
  
  const addCustomAmal = useCallback((gateId: string, name: string, description?: string) => {
    if (!name.trim()) return;
    const newAmal: CustomAmal = { id: `custom-${Date.now()}`, name: name.trim(), description: description?.trim(), gateId };
    setCustomAmalan(prev => [...prev, newAmal]);
    setUser(prev => ({ ...prev, selectedAmalanIds: [...prev.selectedAmalanIds, newAmal.id] }));
  }, [setCustomAmalan, setUser]);

  const editCustomAmal = useCallback((amalId: string, name: string, description?: string) => {
    if (!name.trim()) return;
    setCustomAmalan(prev => prev.map(a => a.id === amalId ? { ...a, name: name.trim(), description: description?.trim() } : a));
  }, [setCustomAmalan]);

  const deleteCustomAmal = useCallback((amalId: string) => {
    setCustomAmalan(prev => prev.filter(a => a.id !== amalId));
    setAmalLog(prevLog => {
      const newLog = { ...prevLog };
      Object.keys(newLog).forEach(date => {
        if (newLog[date][amalId] !== undefined) {
          const newDateLog = { ...newLog[date] };
          delete newDateLog[amalId];
          newLog[date] = newDateLog;
        }
      });
      return newLog;
    });
  }, [setCustomAmalan, setAmalLog]);

  const getAnalyticsData = useCallback(() => {
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
    }).reverse();
    const gateData = rizqGates.map(gate => ({
        ...gate,
        progressHistory: last7Days.map(date => ({ date, progress: calculateGateProgress(gate, date) }))
    }));
    return { dates: last7Days, gateData };
  }, [rizqGates, calculateGateProgress]);
  
  const startChallenge = useCallback((challengeId: string) => {
    setUser(prevUser => {
        const alreadyActive = prevUser.challenges.some(c => c.challengeId === challengeId && c.status === 'active');
        if (alreadyActive) return prevUser;
        return { ...prevUser, challenges: [...prevUser.challenges, { challengeId, startDate: todayKey(), status: 'active', progress: {} }] };
    });
  }, [setUser]);

  const cancelChallenge = useCallback((challengeId: string) => {
    setUser(prevUser => ({ ...prevUser, challenges: prevUser.challenges.filter(c => c.challengeId !== challengeId) }));
  }, [setUser]);

  const toggleAmalanSelection = useCallback((amalId: string) => {
    setUser(prev => {
      const isSelected = prev.selectedAmalanIds.includes(amalId);
      const newSelected = isSelected ? prev.selectedAmalanIds.filter(id => id !== amalId) : [...prev.selectedAmalanIds, amalId];
      return { ...prev, selectedAmalanIds: newSelected };
    });
  }, [setUser]);

  return { 
    rizqGates, amalLog, journal, theme, customAmalan, user, allRewards, allChallenges,
    startChallenge, cancelChallenge, logout, login, register, getRewardsWithProgress, 
    updateUser: setUser, addCustomAmal, editCustomAmal, deleteCustomAmal, toggleAmal, 
    isAmalCompleted, calculateStreak, calculateGateProgress, calculateOverallProgress, 
    addJournalEntry, editJournalEntry, deleteJournalEntry, toggleAmalanSelection, 
    toggleTheme, getAnalyticsData, todayKey: todayKey(),
    isAuthenticated: !!userData,
    syncStatus,
    lastSyncedAt,
    syncWithCloud
  };
};
