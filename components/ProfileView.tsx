import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface ProfileViewProps {
  user: User;
  updateUser: (user: User) => void;
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

export const ProfileView: React.FC<ProfileViewProps> = ({ user, updateUser }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [formData, setFormData] = useState<User>(user);
  const [isSaved, setIsSaved] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        notificationSettings: {
            ...prev.notificationSettings,
            [field]: value,
        },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast(t.fileTooLarge, 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const dummyAvatar = (gender: string) => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-4xl">
        {gender === 'Perempuan' || gender === 'Female' ? '🧕' : '👤'}
    </div>
  );

  const handleRequestPermission = async () => {
    if (permissionStatus !== 'default') return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
        handleNotificationSettingsChange('enabled', true);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsSaved(true);
    showToast(t.profileUpdateSuccess);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-2">
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 10 }}
                exit={{ opacity: 0 }}
                className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none"
            >
                <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                    toast.type === 'success' 
                    ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                    : 'bg-rose-500/90 border-rose-400 text-white'
                }`}>
                    <Icon size={18}>
                        {toast.type === 'success' ? (
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4" />
                        ) : (
                            <>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m15 9-6 6"/>
                                <path d="m9 9 6 6"/>
                            </>
                        )}
                    </Icon>
                    <span className="font-bold text-sm tracking-tight">{toast.message}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative z-10 transition-transform group-hover:scale-105 duration-500">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            dummyAvatar(formData.gender || 'Laki-laki')
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 z-20 w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all active:scale-90"
                    >
                        <Icon size={18}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>
                    </button>
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-125 -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.profileImgHint}</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.profileIdentity}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.name}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t.profileNamePlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.email}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t.profileEmailPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.phone}</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder={t.profilePhonePlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.gender}</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all appearance-none"
                            >
                                <option value={language === 'id' ? 'Laki-laki' : 'Male'}>{t.male}</option>
                                <option value={language === 'id' ? 'Perempuan' : 'Female'}>{t.female}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.profileCity}</label>
                            <input
                                type="text"
                                name="residence"
                                value={formData.residence || ''}
                                onChange={handleChange}
                                placeholder={t.profileCityPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.profileProfession}</label>
                            <input
                                type="text"
                                name="profession"
                                value={formData.profession || ''}
                                onChange={handleChange}
                                placeholder={t.profileProfessionPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.profileVision}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.profileSpiritualGoal}</label>
                            <input
                                type="text"
                                name="spiritualGoal"
                                value={formData.spiritualGoal}
                                onChange={handleChange}
                                placeholder={t.profileSpiritualGoalPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.profileRecitation}</label>
                            <input
                                type="text"
                                name="preferredRecitation"
                                value={formData.preferredRecitation}
                                onChange={handleChange}
                                placeholder={t.profileRecitationPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t.profileNiat}</label>
                            <textarea
                                name="niat"
                                value={formData.niat}
                                onChange={handleChange}
                                rows={3}
                                placeholder={t.profileNiatPlaceholder}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex pt-4">
                    <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 dark:shadow-none hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                        <Icon size={18}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
                        <span>{t.profileUpdate}</span>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};