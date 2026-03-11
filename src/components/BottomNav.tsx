import React from 'react';
import { t } from '../i18n';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: string;
}

export default function BottomNav({ activeTab, setActiveTab, lang }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: 'fa-home', label: t(lang, 'home') },
    { id: 'batch', icon: 'fa-layer-group', label: t(lang, 'batch') },
    { id: 'history', icon: 'fa-history', label: t(lang, 'history') },
    { id: 'settings', icon: 'fa-cog', label: t(lang, 'settings') },
  ];

  return (
    <div dir="ltr" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            activeTab === tab.id ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <i className={`fas ${tab.icon} text-xl ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}></i>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
