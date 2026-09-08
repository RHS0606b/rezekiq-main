import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from './icons/Icon';
import { translations } from '../translations';
import { User } from '../types';

interface BottomBarProps {
  user: User;
  onMoreClick: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ user, onMoreClick }) => {
  const t = translations[user?.language || 'id'];

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300
        ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}
      `}
    >
      <div className="relative">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-tighter truncate w-full text-center px-1">
        {label}
      </span>
    </NavLink>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-[100] px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        <NavItem 
          to="/dashboard" 
          label={t.dashboard}
          icon={<Icon size={20}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Icon>}
        />
        <NavItem 
          to="/rencana-hari-ini" 
          label={t.today}
          icon={<Icon size={20}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></Icon>}
        />
        <NavItem 
          to="/jurnal-rezeki" 
          label={t.journal}
          icon={<Icon size={20}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-5" /></Icon>}
        />
        <NavItem 
          to="/analitik" 
          label={t.analytics}
          icon={<Icon size={20}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></Icon>}
        />
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-400 dark:text-gray-500 active:scale-95 transition-transform"
        >
          <Icon size={20}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Icon>
          <span className="text-[9px] font-black uppercase tracking-tighter truncate w-full text-center px-1">
            {t.more}
          </span>
        </button>
      </div>
    </nav>
  );
};
