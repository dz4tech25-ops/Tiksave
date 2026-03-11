import React, { useState, useEffect } from 'react';
import { t } from '../i18n';
import { AdPlaceholder } from './AdPlaceholder';

export default function History({ lang }: { lang: string }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ts-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('ts-history');
    setHistory([]);
  };

  const deleteItem = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    if (newHistory.length === 0) {
      localStorage.removeItem('ts-history');
    } else {
      localStorage.setItem('ts-history', JSON.stringify(newHistory));
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add a small toast here if needed, but simple is fine
    } catch (e) {}
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 pt-8 flex flex-col gap-6">
      <AdPlaceholder type="banner" />
      
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t(lang, 'history_title')}</h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-sm text-red-500 font-medium active:scale-95 transition-transform">
              {t(lang, 'clear')}
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-sm border border-slate-200 dark:border-slate-800">
            <i className="fas fa-history text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
            <p className="text-slate-500 dark:text-slate-400">{t(lang, 'no_history')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <div key={i} className="flex gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <img src={item.thumbnail} className="w-16 h-20 rounded-xl object-cover" alt="cover" />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1" dir="ltr">@{item.author}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-slate-400">{new Date(item.date).toLocaleString(lang)}</p>
                    <div className="flex gap-2">
                      {item.originalUrl && (
                        <button 
                          onClick={() => copyLink(item.originalUrl)}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title={t(lang, 'copy_link')}
                        >
                          <i className="fas fa-link text-xs"></i>
                        </button>
                      )}
                      <button 
                        onClick={() => deleteItem(i)}
                        className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        title={t(lang, 'delete')}
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AdPlaceholder type="mrec" />
    </div>
  );
}
