import React, { useState, useEffect } from 'react';
import { useRizqData } from '../hooks/useRizqData';
import { Icon } from './icons/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

type JournalViewProps = ReturnType<typeof useRizqData>;

export const JournalView: React.FC<JournalViewProps> = ({ journal, addJournalEntry, editJournalEntry, deleteJournalEntry, user }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      editJournalEntry(editingId, newEntry);
      showToast(t.journalUpdateSuccess);
      setEditingId(null);
    } else {
      addJournalEntry(newEntry);
      showToast(t.journalSaveSuccess);
    }
    setNewEntry('');
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setNewEntry(content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteJournalEntry(showDeleteConfirm);
      showToast(t.journalDeleteSuccess, 'error');
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Toast Notification */}
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 20, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none"
                >
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
                        toast.type === 'success' 
                        ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                        : 'bg-rose-500/90 border-rose-400 text-white'
                    }`}>
                        <Icon size={20}>
                            {toast.type === 'success' ? [
                                <path key="p1" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>,
                                <path key="p2" d="m9 11 3 3L22 4"/>
                            ] : [
                                <circle key="c1" cx="12" cy="12" r="10"/>,
                                <path key="p1" d="m15 9-6 6"/>,
                                <path key="p2" d="m9 9 6 6"/>
                            ]}
                        </Icon>
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700"
                    >
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Icon size={32}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Icon>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{t.journalDeleteConfirm}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">{t.journalDeleteWarning}</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200 dark:shadow-none transition-all"
                            >
                                {t.delete}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Entry Form */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Icon size={24}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingId ? t.journalEditTitle : t.journalTodayTitle}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.journalSub}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10">
                <textarea
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder={t.journalPlaceholder}
                    className="w-full p-4 border-2 bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-medium min-h-[160px] text-gray-800 dark:text-gray-200"
                    rows={5}
                />
                
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95" 
                        disabled={!newEntry.trim()}
                    >
                        <Icon size={20} className="group-hover:scale-110 transition-transform"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
                        <span>{editingId ? t.journalUpdate : t.journalSave}</span>
                    </button>
                    {editingId && (
                         <button 
                            type="button"
                            onClick={() => { setEditingId(null); setNewEntry(''); }}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                         >
                            {t.cancel}
                         </button>
                    )}
                </div>
            </form>
        </div>

        {/* Journal History */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Icon size={24} className="text-emerald-500"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Icon>
                    {t.journalHistory}
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {journal.length} {t.journalEntri}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {journal.length > 0 ? (
                    journal.map((entry, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={entry.id} 
                            className="bg-white dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold text-xs">
                                        {new Date(entry.date).getDate()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            {new Date(entry.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                            {new Date(entry.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEdit(entry.id, entry.content)}
                                        className="p-2 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                        title={t.journalEditTooltip}
                                    >
                                        <Icon size={18}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(entry.id)}
                                        className="p-2 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                        title={t.journalDeleteTooltip}
                                    >
                                        <Icon size={18}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Icon>
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{entry.content}</p>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center text-4xl mb-6">📖</div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.journalEmpty}</h4>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2">{t.journalEmptySub}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};