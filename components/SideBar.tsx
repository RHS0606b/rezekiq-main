import React from 'react';
import { Link } from 'react-router-dom';
import { RizqGate, User } from '../types';
import { translations } from '../translations';
import { Icon } from './icons/Icon';
import { motion } from 'motion/react';

interface SideBarProps {
    gates: RizqGate[];
    activePath: string;
    getGateProgress: (gate: RizqGate) => number;
    user: User;
    isMobileOpen: boolean;
    onClose: () => void;
    logout: () => void;
}

const NavButton: React.FC<{
    to?: string;
    onClick?: () => void;
    isActive: boolean;
    children: React.ReactNode;
    icon: React.ReactNode;
    variant?: 'default' | 'danger';
}> = ({ to, onClick, isActive, children, icon, variant = 'default' }) => {
    const content = (
        <>
            <div className={`p-1.5 rounded-lg transition-colors relative z-10 ${isActive
                    ? 'bg-white/20'
                    : variant === 'danger'
                        ? 'bg-rose-50 dark:bg-rose-900/20 group-hover:bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-900/30'
                }`}>
                {icon}
            </div>
            <span className="relative z-10">{children}</span>
            {isActive && (
                <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 -z-0"
                />
            )}
        </>
    );

    const className = `group w-full text-left px-4 py-3 text-xs font-black uppercase tracking-[0.1em] rounded-[20px] transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${isActive
            ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none'
            : variant === 'danger'
                ? 'text-rose-500 hover:text-white dark:hover:text-white hover:bg-rose-500 shadow-none'
                : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-gray-800/50'
        }`;

    if (to) {
        return (
            <Link to={to} onClick={onClick} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {content}
        </button>
    );
};

export const SideBar: React.FC<SideBarProps> = ({ gates, activePath, getGateProgress, user, isMobileOpen, onClose, logout }) => {
    const language = user?.language || 'id';
    const t = translations[language];
    const [isGatesOpen, setIsGatesOpen] = React.useState(true);

    return (
        <aside className={`
      absolute md:relative 
      w-80 bg-white/70 dark:bg-gray-900/80 
      backdrop-blur-2xl
      border-r border-gray-100 dark:border-gray-800 
      flex flex-col h-full z-50
      transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
                        />
                        <h1 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">Rezeki<span className="text-emerald-500">Q</span></h1>
                    </Link>
                    <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Icon size={20}><path d="M18 6 6 18M6 6l12 12" /></Icon>
                    </button>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto scroll-smooth custom-scrollbar">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.sidebarNav}</span>
                </div>

                <NavButton to="/dashboard" onClick={onClose} isActive={activePath === '/dashboard'} icon={<Icon size={16}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></Icon>}>{t.dashboard}</NavButton>
                <NavButton to="/rencana-hari-ini" onClick={onClose} isActive={activePath === '/rencana-hari-ini'} icon={<Icon size={16}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></Icon>}>{t.today}</NavButton>
                <NavButton to="/jurnal-rezeki" onClick={onClose} isActive={activePath === '/jurnal-rezeki'} icon={<Icon size={16}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-5" /></Icon>}>{t.journal}</NavButton>
                <NavButton to="/analitik" onClick={onClose} isActive={activePath === '/analitik'} icon={<Icon size={16}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></Icon>}>{t.analytics}</NavButton>
                <NavButton to="/rizq-ai-coach" onClick={onClose} isActive={activePath === '/rizq-ai-coach'} icon={<Icon size={16}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></Icon>}>{t.aiCoach}</NavButton>

                <div className="pt-8">
                    <button
                        onClick={() => setIsGatesOpen(!isGatesOpen)}
                        className="w-full px-4 mb-4 flex items-center justify-between group cursor-pointer"
                    >
                        <span className="text-[10px] font-black text-gray-400 group-hover:text-emerald-500 transition-colors uppercase tracking-[0.3em]">{t.eightPintu}</span>
                        <motion.div
                            animate={{ rotate: isGatesOpen ? 0 : -90 }}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                        >
                            <Icon size={12}><path d="m6 9 6 6 6-6" /></Icon>
                        </motion.div>
                    </button>
                    <motion.div
                        initial={false}
                        animate={{
                            height: isGatesOpen ? 'auto' : 0,
                            opacity: isGatesOpen ? 1 : 0
                        }}
                        className="space-y-1 overflow-hidden"
                    >
                        {gates.map(gate => {
                            const gateSlugs: { [key: string]: string } = {
                                'syukur': '/syukur',
                                'usaha': '/usaha-ikhtiar',
                                'tawakal': '/tawakal',
                                'istighfar': '/istighfar',
                                'sedekah': '/sedekah',
                                'anak': '/anak',
                                'nikah': '/nikah',
                                'dijamin': '/dijamin'
                            };
                            const gatePath = gateSlugs[gate.id] || `/gate/${gate.id}`;
                            const isActive = activePath === gatePath;
                            const progress = getGateProgress(gate);
                            return (
                                <Link
                                    key={gate.id}
                                    to={gatePath}
                                    onClick={onClose}
                                    className={`w-full group text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center justify-between ${isActive
                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg transition-transform group-hover:scale-125 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>{gate.emoji}</span>
                                        <span className={isActive ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}>
                                            {gate.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] mb-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>{progress}%</span>
                                        <div className="w-10 bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </motion.div>
                </div>

                <div className="pt-8 pb-10">
                    <div className="px-4 mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.sidebarSystem}</span>
                    </div>
                    <NavButton to="/tantangan" onClick={onClose} isActive={activePath === '/tantangan'} icon={<Icon size={16}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Icon>}>{t.challenges}</NavButton>
                    <NavButton to="/pengaturan" onClick={onClose} isActive={activePath === '/pengaturan'} icon={<Icon size={16}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></Icon>}>{t.settings}</NavButton>
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <NavButton onClick={logout} isActive={false} icon={<Icon size={16}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>} variant="danger">{t.logout}</NavButton>
                    </div>
                </div>
            </nav>
        </aside>
    );
};
