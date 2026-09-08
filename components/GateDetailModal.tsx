

import React, { useState } from 'react';
import { RizqGate, Amal, User } from '../types';
import { Icon } from './icons/Icon';
import { translations } from '../translations';

interface GateDetailModalProps {
  gate: RizqGate | null;
  onClose: () => void;
  onToggleAmal: (gateId: string, amalId: string) => void;
  isAmalCompleted: (amalId: string) => boolean;
  user: User;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      active ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-emerald-100'
    }`}
  >
    {children}
  </button>
);

const AmalItem: React.FC<{ amal: Amal; onToggle: () => void; color: string; isCompleted: boolean; }> = ({ amal, onToggle, color, isCompleted }) => (
  <div
    onClick={onToggle}
    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
      isCompleted ? 'bg-emerald-100 text-gray-500 line-through' : 'bg-white hover:bg-gray-50'
    }`}
  >
    <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${isCompleted ? `bg-${color}-500 border-${color}-500` : `border-gray-300`}`}>
      {isCompleted && <Icon size={16} className="text-white"><path d="M20 6 9 17l-5-5" /></Icon>}
    </div>
    <div className="ml-4">
      <p className="font-semibold text-gray-800">{amal.name}</p>
      <p className="text-sm text-gray-500">{amal.description}</p>
    </div>
  </div>
);


export const GateDetailModal: React.FC<GateDetailModalProps> = ({ gate, onClose, onToggleAmal, isAmalCompleted, user }) => {
  const language = user?.language || 'id';
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'amalan' | 'info'>('amalan');

  if (!gate) return null;

  const handleToggle = (amalId: string) => {
    onToggleAmal(gate.id, amalId);
  };
  
  const colorVariants = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    teal: 'bg-teal-500',
    fuchsia: 'bg-fuchsia-500',
    slate: 'bg-slate-500',
  };
  const colorKey = gate.color as keyof typeof colorVariants;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className={`p-4 sm:p-6 rounded-t-2xl text-white ${colorVariants[colorKey]}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl sm:text-4xl">{gate.emoji}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{gate.name}</h2>
                <p className="text-sm opacity-90">{gate.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition-colors">
              <Icon size={24}><path d="M18 6 6 18M6 6l12 12" /></Icon>
            </button>
          </div>
        </header>

        <nav className="p-2 border-b bg-white">
          <div className="flex space-x-2">
            <TabButton active={activeTab === 'amalan'} onClick={() => setActiveTab('amalan')}>{t.amalPraktis}</TabButton>
            <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')}>{t.dalilKisah}</TabButton>
          </div>
        </nav>

        <main className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'amalan' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-emerald-800">{t.checklistDaily}</h3>
              <div className="space-y-3">
                {gate.amalan.map(amal => (
                  <AmalItem key={amal.id} amal={amal} onToggle={() => handleToggle(amal.id)} color={gate.color} isCompleted={isAmalCompleted(amal.id)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">{t.dalilHadis}</h3>
                <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50 text-gray-700 italic">
                  {gate.dalil}
                </blockquote>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">{t.kisahInspiratif}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {gate.kisah}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};