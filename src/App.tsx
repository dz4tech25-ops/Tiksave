import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BatchDownload from './components/BatchDownload';
import History from './components/History';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedTheme = localStorage.getItem('ts-theme') || 'light';
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ts-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ts-theme', 'light');
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-y-auto pt-14 pb-16">
        <div className="h-full">
          {activeTab === 'home' && <Hero lang={lang} />}
          {activeTab === 'batch' && <BatchDownload lang={lang} />}
          {activeTab === 'history' && <History lang={lang} />}
          {activeTab === 'settings' && (
            <Settings 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              lang={lang} 
              setLang={setLang} 
            />
          )}
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
}
