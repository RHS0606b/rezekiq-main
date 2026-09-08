import React, { useState, useEffect } from 'react';
import { User, Theme } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface SettingsViewProps {
  user: User;
  updateUser: (user: User) => void;
  theme: Theme;
  toggleTheme: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  lastSyncedAt?: string | null;
  syncWithCloud?: () => Promise<any>;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ${checked ? 'bg-emerald-600 shadow-md shadow-emerald-200' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1.5'}`} />
    </button>
  );
};

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  user, updateUser, theme, toggleTheme,
  syncStatus = 'idle', lastSyncedAt, syncWithCloud 
}) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [formData, setFormData] = useState<User>(user);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!syncWithCloud) return;
    setIsSyncing(true);
    try {
      await syncWithCloud();
      showToast(t.syncSuccess, 'success');
    } catch {
      showToast(t.syncFailed, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNotificationSettingsChange = (field: string, value: any) => {
    const updatedUser = {
        ...formData,
        notificationSettings: {
            ...formData.notificationSettings,
            [field]: value,
        },
    };
    setFormData(updatedUser);
    updateUser(updatedUser);
    showToast(t.settingsNotifUpdate);
  };

  const handleRequestPermission = async () => {
    if (permissionStatus !== 'default') return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
        handleNotificationSettingsChange('enabled', true);
    }
  };

  const updateSoundPref = (checked: boolean) => {
    const updated = { ...formData, soundEffectsEnabled: checked };
    setFormData(updated);
    updateUser(updated);
    showToast(checked ? t.settingsSoundOn : t.settingsSoundOff);
  };

  const updateLanguage = (lang: 'id' | 'en') => {
    const updated = { ...formData, language: lang };
    setFormData(updated);
    updateUser(updated);
    showToast(`${t.settingsLangChanged} ${lang === 'id' ? 'Indonesia' : 'English'}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-2 lg:px-0">
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 10 }}
                exit={{ opacity: 0 }}
                className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none"
            >
                <div className="px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border bg-emerald-500/90 border-emerald-400 text-white">
                    <Icon size={18}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4" /></Icon>
                    <span className="font-bold text-sm tracking-tight">{toast.message}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t.settingsTitle}</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.settingsSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Toggle */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
                <div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                         <Icon size={24}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></Icon>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{t.settingsTheme}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">{t.settingsThemeDesc}</p>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">{theme === 'light' ? t.settingsThemeLight : t.settingsThemeDark}</span>
                    <button 
                        onClick={toggleTheme}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
                    >
                        {t.settingsThemeBtn}
                    </button>
                </div>
            </motion.div>

            {/* Language Selection */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
                <div>
                    <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6">
                         <Icon size={24}><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/></Icon>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{t.settingsLang}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">{t.settingsLangDesc}</p>
                </div>
                <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={() => updateLanguage('id')}
                        className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${formData.language === 'id' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Indonesia
                    </button>
                    <button 
                        onClick={() => updateLanguage('en')}
                        className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${formData.language === 'en' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        English
                    </button>
                </div>
            </motion.div>
        </div>

        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
             {/* Sound Preference */}
             <div className="p-8 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[22px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon size={24}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></Icon>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.settingsSound}</h4>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.settingsSoundDesc}</p>
                    </div>
                </div>
                <ToggleSwitch 
                    checked={formData.soundEffectsEnabled} 
                    onChange={updateSoundPref}
                />
            </div>

            {/* Notification Logic */}
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-[22px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Icon size={24}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.settingsNotif}</h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.settingsNotifDesc}</p>
                        </div>
                    </div>
                    {permissionStatus === 'granted' ? (
                        <ToggleSwitch 
                            checked={formData.notificationSettings.enabled} 
                            onChange={(checked) => handleNotificationSettingsChange('enabled', checked)}
                        />
                    ) : (
                        <button 
                            type="button" 
                            onClick={handleRequestPermission} 
                            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            {t.settingsNotifBtn}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {formData.notificationSettings.enabled && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                                        <Icon size={18}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{t.settingsNotifTime}</p>
                                </div>
                                <input
                                    type="time"
                                    value={formData.notificationSettings.time}
                                    onChange={(e) => handleNotificationSettingsChange('time', e.target.value)}
                                    className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 font-black p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-700 focus:outline-none ring-4 ring-emerald-100 dark:ring-emerald-900/20"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Cloud & Local Storage Card */}
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[22px] flex items-center justify-center flex-shrink-0">
                            <Icon size={24}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></Icon>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.cloudStorageTitle}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    syncStatus === 'synced' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                    syncStatus === 'syncing' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {syncStatus === 'synced' ? t.cloudSynced : syncStatus === 'syncing' ? t.cloudSyncing : t.cloudOffline}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t.cloudStorageDesc}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleManualSync}
                        disabled={isSyncing || syncStatus === 'syncing'}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                    >
                        <Icon size={16}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></Icon>
                        {isSyncing || syncStatus === 'syncing' ? t.cloudSyncing : t.cloudSyncNow}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100/60 dark:border-gray-800/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Status Akun Cloud</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate block">
                            {user?.email || 'Mode Tamu / Lokal'}
                        </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100/60 dark:border-gray-800/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">{t.lastSyncedAt}</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                            {lastSyncedAt ? `${lastSyncedAt}` : 'Belum disinkronkan'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
