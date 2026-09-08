import React, { useMemo, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SideBar } from './components/SideBar';
import { BottomBar } from './components/BottomBar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { GateDetailView } from './components/GateDetailView';
import { TodayView } from './components/TodayView';
import { JournalView } from './components/JournalView';
import AnalyticsView from './components/AnalyticsView';
import { RizqAIChat } from './components/RizqAIChat';
import { ProfileView } from './components/ProfileView';
import { RewardsView } from './components/RewardsView';
import { ChallengesView } from './components/ChallengesView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { LandingPage } from './components/LandingPage';
import { useRizqData } from './hooks/useRizqData';
import { useAudio } from './hooks/useAudio';
import { View } from './types';

import { translations } from './translations';

function App() {
  const data = useRizqData();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = data.user?.language || 'id';
  const t = translations[lang as 'id' | 'en'];
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const notificationTimer = useRef<number | null>(null);

  const { playSound, initializeAudio } = useAudio(!data.user?.soundEffectsEnabled);
  const prevRewardsCount = useRef(data.user?.earnedRewards?.length || 0);

  useEffect(() => {
    if (data.isAuthenticated) {
        if (location.pathname === '/' || location.pathname === '/auth') {
            navigate('/dashboard');
        }
    } else {
        if (location.pathname !== '/auth' && location.pathname !== '/') {
            navigate('/');
        }
    }
  }, [data.isAuthenticated, location.pathname, navigate]);

  const handleAuth = async (mode: 'login' | 'register', authData: any) => {
    try {
        let user;
        if (mode === 'register') {
            user = data.register(authData);
        } else {
            user = data.login(authData.email, authData.password);
        }

        if (user) {
            const greeting = user.gender === 'Perempuan' ? t.welcomeUkhti : t.welcomeAkhi;
            toast.success(`${greeting}, ${user.name}!`, {
                duration: 5000,
                icon: '🌿',
                style: {
                    borderRadius: '20px',
                    background: '#065f46',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                    letterSpacing: '1px'
                },
            });
            playSound('celebrate');
            navigate('/dashboard');
        }
    } catch (err: any) {
        toast.error(err.message, {
            style: { borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
        });
    }
  };

  useEffect(() => {
    if (!data.user) return;
    const currentRewardsCount = data.user.earnedRewards.length;
    if (currentRewardsCount > prevRewardsCount.current) {
        playSound('reward');
    }
    prevRewardsCount.current = currentRewardsCount;
  }, [data.user?.earnedRewards, playSound]);

  useEffect(() => {
    // Sync theme class to html and body
    const root = document.documentElement;
    if (data.theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [data.theme]);


  useEffect(() => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    if (typeof window === 'undefined' || !('Notification' in window) || !data.user) {
        return; // Notifications not supported or no user
    }

    const { enabled, time } = data.user.notificationSettings;

    if (!enabled || Notification.permission !== 'granted') {
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    if (now.getTime() > notificationDate.getTime()) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    const delay = notificationDate.getTime() - now.getTime();
    if (delay > 0) {
      notificationTimer.current = window.setTimeout(() => {
        new Notification(t.notifTitle, {
          body: t.notifBody,
          icon: '/favicon.svg'
        });
      }, delay);
    }
    
    return () => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
    }

  }, [data.user.notificationSettings]);

  const viewTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard') return t.dashboard;
    if (path === '/rencana-hari-ini') return t.today;
    if (path === '/jurnal-rezeki') return t.journal;
    if (path === '/analitik') return t.analytics;
    if (path === '/rizq-ai-coach') return t.aiCoach;
    if (path === '/profile') return t.profile;
    if (path === '/rewards') return t.rewards;
    if (path === '/tantangan') return t.challenges;
    if (path === '/pengaturan') return t.settings;
    
    // Check for gate paths
    const gateSlugs: { [key: string]: string } = {
        '/syukur': 'syukur',
        '/usaha-ikhtiar': 'usaha',
        '/tawakal': 'tawakal',
        '/istighfar': 'istighfar',
        '/sedekah': 'sedekah',
        '/anak': 'anak',
        '/nikah': 'nikah',
        '/dijamin': 'dijamin'
    };

    const gateId = gateSlugs[path];
    if (gateId) {
        const gate = data.rizqGates.find(g => g.id === gateId);
        return gate?.name || '';
    }
    
    return t.dashboard;
  }, [location.pathname, data.rizqGates, t]);
  
  const rewardsWithProgress = useMemo(() => data.getRewardsWithProgress(), [data]);

  const handleToggleAmal = (amalId: string, date: string) => {
    if (!data.isAmalCompleted(amalId, date)) {
        playSound('complete');
    }
    data.toggleAmal(amalId, date);
  }
  
  const handleStartChallenge = (challengeId: string) => {
    playSound('start');
    data.startChallenge(challengeId);
  }

  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen w-screen overflow-hidden" onClick={initializeAudio}>
      <Toaster position="top-center" />
      {isSidebarOpen && (
          <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
          ></div>
      )}
      <SideBar 
        gates={data.rizqGates}
        activePath={location.pathname}
        getGateProgress={(gate) => data.calculateGateProgress(gate, data.todayKey)}
        user={data.user}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        logout={data.logout}
      />
      <div className="flex-1 flex flex-col bg-[#fcfdfd] dark:bg-gray-950 min-w-0 transition-colors duration-300">
        <Header 
          title={viewTitle} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          theme={data.theme}
          toggleTheme={data.toggleTheme}
          user={data.user}
          logout={data.logout}
          updateUser={data.updateUser}
          syncStatus={data.syncStatus}
          lastSyncedAt={data.lastSyncedAt}
          onSync={async () => {
            try {
              await data.syncWithCloud();
              toast.success(t.syncSuccess, { style: { borderRadius: '20px', fontSize: '12px' } });
            } catch {
              toast.error(t.syncFailed, { style: { borderRadius: '20px', fontSize: '12px' } });
            }
          }}
        />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </main>
        <BottomBar user={data.user} onMoreClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );

  const GateRoute = ({ gateId }: { gateId: string }) => {
    const currentGate = data.rizqGates.find(g => g.id === gateId);
    return currentGate ? (
        <GateDetailView 
            gate={currentGate}
            isAmalCompleted={(amalId) => data.isAmalCompleted(amalId, data.todayKey)}
            toggleAmal={(amalId) => handleToggleAmal(amalId, data.todayKey)}
            calculateStreak={data.calculateStreak}
            customAmalan={data.customAmalan.filter(a => a.gateId === currentGate.id)}
            addCustomAmal={data.addCustomAmal}
            editCustomAmal={data.editCustomAmal}
            deleteCustomAmal={data.deleteCustomAmal}
            rewardsWithProgress={rewardsWithProgress}
            user={data.user}
            playSound={playSound}
        />
    ) : <Navigate to="/dashboard" />;
  };

  const gateRouteMapper = (id: string) => {
    switch(id) {
        case 'syukur': return '/syukur';
        case 'usaha': return '/usaha-ikhtiar';
        case 'tawakal': return '/tawakal';
        case 'istighfar': return '/istighfar';
        case 'sedekah': return '/sedekah';
        case 'anak': return '/anak';
        case 'nikah': return '/nikah';
        case 'dijamin': return '/dijamin';
        default: return `/dashboard`;
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <>
            <Toaster position="top-center" />
            <LandingPage 
                onStart={() => navigate('/auth?mode=register')} 
                onLogin={() => navigate('/auth?mode=login')}
                theme={data.theme}
                toggleTheme={data.toggleTheme}
                language={data.user?.language || 'id'}
                setLanguage={(lang) => data.user && data.updateUser({...data.user, language: lang})}
            />
        </>
      } />
      
      <Route path="/auth" element={
        <>
            <Toaster position="top-center" />
            <AuthView 
                mode={(new URLSearchParams(location.search).get('mode') as 'login' | 'register') || 'login'}
                onAuth={handleAuth}
                onSwitchMode={(mode) => navigate(`/auth?mode=${mode}`)}
                onBack={() => navigate('/')}
                theme={data.theme}
                toggleTheme={data.toggleTheme}
                language={data.user?.language || 'id'}
                setLanguage={(lang) => data.user && data.updateUser({...data.user, language: lang})}
            />
        </>
      } />

      <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard gates={data.rizqGates} onSelectGate={(id) => navigate(gateRouteMapper(id))} getGateProgress={(gate) => data.calculateGateProgress(gate, data.todayKey)} overallProgress={data.calculateOverallProgress(data.todayKey)} language={data.user?.language || 'id'} /></AuthenticatedLayout>} />
      <Route path="/rencana-hari-ini" element={<AuthenticatedLayout><TodayView {...data} toggleAmal={handleToggleAmal} rewardsWithProgress={rewardsWithProgress} /></AuthenticatedLayout>} />
      <Route path="/jurnal-rezeki" element={<AuthenticatedLayout><JournalView {...data} /></AuthenticatedLayout>} />
      <Route path="/analitik" element={<AuthenticatedLayout><AnalyticsView {...data} /></AuthenticatedLayout>} />
      <Route path="/rizq-ai-coach" element={<AuthenticatedLayout><RizqAIChat playSound={playSound} user={data.user} /></AuthenticatedLayout>} />
      <Route path="/profile" element={<AuthenticatedLayout><ProfileView user={data.user} updateUser={data.updateUser} /></AuthenticatedLayout>} />
      <Route path="/rewards" element={<AuthenticatedLayout><RewardsView rewardsWithProgress={rewardsWithProgress} user={data.user} /></AuthenticatedLayout>} />
      <Route path="/tantangan" element={<AuthenticatedLayout><ChallengesView allChallenges={data.allChallenges} user={data.user} startChallenge={handleStartChallenge} cancelChallenge={data.cancelChallenge} allRewards={data.allRewards} rizqGates={data.rizqGates} /></AuthenticatedLayout>} />
      <Route path="/pengaturan" element={<AuthenticatedLayout><SettingsView user={data.user} updateUser={data.updateUser} theme={data.theme} toggleTheme={data.toggleTheme} syncStatus={data.syncStatus} lastSyncedAt={data.lastSyncedAt} syncWithCloud={data.syncWithCloud} /></AuthenticatedLayout>} />
      
      <Route path="/syukur" element={<AuthenticatedLayout><GateRoute gateId="syukur" /></AuthenticatedLayout>} />
      <Route path="/usaha-ikhtiar" element={<AuthenticatedLayout><GateRoute gateId="usaha" /></AuthenticatedLayout>} />
      <Route path="/tawakal" element={<AuthenticatedLayout><GateRoute gateId="tawakal" /></AuthenticatedLayout>} />
      <Route path="/istighfar" element={<AuthenticatedLayout><GateRoute gateId="istighfar" /></AuthenticatedLayout>} />
      <Route path="/sedekah" element={<AuthenticatedLayout><GateRoute gateId="sedekah" /></AuthenticatedLayout>} />
      <Route path="/anak" element={<AuthenticatedLayout><GateRoute gateId="anak" /></AuthenticatedLayout>} />
      <Route path="/nikah" element={<AuthenticatedLayout><GateRoute gateId="nikah" /></AuthenticatedLayout>} />
      <Route path="/dijamin" element={<AuthenticatedLayout><GateRoute gateId="dijamin" /></AuthenticatedLayout>} />

      <Route path="/" element={<Navigate to={data.isAuthenticated ? "/dashboard" : "/"} />} />
      <Route path="*" element={<Navigate to={data.isAuthenticated ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

export default App;
