import React, { useState, useEffect } from 'react';
import { fetchTikTokVideoData, forceDownload } from '../services/api';
import { t } from '../i18n';
import { AdPlaceholder } from './AdPlaceholder';

export default function BatchDownload({ lang }: { lang: string }) {
  const [urlsText, setUrlsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.batchResults === false) {
        setShowResults(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const saveToHistory = (videoData: any) => {
    try {
      const stored = localStorage.getItem('ts-history');
      let history = stored ? JSON.parse(stored) : [];
      history = history.filter((item: any) => item.url !== videoData.url);
      history.unshift({
        ...videoData,
        date: new Date().toISOString()
      });
      if (history.length > 50) history = history.slice(0, 50);
      localStorage.setItem('ts-history', JSON.stringify(history));
    } catch (e) {}
  };

  const handleClear = () => {
    if (showResults) {
      window.history.back();
    }
    setUrlsText('');
    setShowResults(false);
    setResults([]);
    setProgress({ current: 0, total: 0 });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isTikTokUrl = (url: string) => {
    const tiktokDomains = ['tiktok.com', 'vt.tiktok.com', 'www.tiktok.com'];
    try {
      const hostname = new URL(url).hostname;
      return tiktokDomains.some(domain => hostname.includes(domain));
    } catch (e) {
      return false;
    }
  };

  const handleBatchDownload = async () => {
    const urls = urlsText.split('\n')
      .map(url => url.trim())
      .filter(url => url && isValidUrl(url) && isTikTokUrl(url));

    if (urls.length === 0) {
      alert(t(lang, 'invalid_url'));
      return;
    }

    setIsProcessing(true);
    window.history.pushState({ batchResults: true }, '', '');
    setShowResults(true);
    setResults([]);
    setProgress({ current: 0, total: urls.length });

    const newResults = [];

    for (let i = 0; i < urls.length; i++) {
      try {
        const videoData = await fetchTikTokVideoData(urls[i]);
        saveToHistory(videoData);
        newResults.push({
          success: true,
          url: urls[i],
          data: videoData,
          index: i
        });
      } catch (error: any) {
        newResults.push({
          success: false,
          url: urls[i],
          error: t(lang, error.message)
        });
      } finally {
        setProgress({ current: i + 1, total: urls.length });
        setResults([...newResults]);
      }
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
  };

  const downloadItem = async (url: string, filename: string) => {
    await forceDownload(url, filename);
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="p-4 max-w-md mx-auto pb-24 pt-8 flex flex-col gap-6">
      <AdPlaceholder type="banner" />
      
      <h2 className="text-xl font-bold px-2 text-slate-800 dark:text-white mb-4">{t(lang, 'batch_title')}</h2>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t(lang, 'batch_desc')}</p>
        <textarea 
          className="w-full min-h-[120px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 outline-none transition-shadow text-sm" 
          placeholder="https://www.tiktok.com/@user1/video/123...&#10;https://www.tiktok.com/@user2/video/456..."
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          disabled={isProcessing}
          dir="ltr"
        ></textarea>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={handleBatchDownload}
            disabled={isProcessing || !urlsText.trim()}
            className="flex-1 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-3 shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? <span className="btn-spinner mr-2"></span> : <i className="fas fa-download mr-2"></i>}
            {t(lang, 'download_all')}
          </button>
          {showResults && !isProcessing && (
            <button 
              onClick={handleBatchDownload}
              className="rounded-2xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-bold px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
              title={t(lang, 'refresh')}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          )}
          <button 
            onClick={handleClear}
            disabled={isProcessing}
            className="rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-6 py-3 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            {t(lang, 'clear')}
          </button>
        </div>
        
        {showResults && (
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between text-xs font-bold mb-2 text-slate-600 dark:text-slate-400">
              <span>{t(lang, 'progress')}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
              <div 
                className="bg-sky-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={idx} className={`p-3 rounded-2xl flex flex-col gap-3 ${result.success ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700' : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30'}`}>
                  {result.success ? (
                    <>
                      <div className="flex gap-3">
                        <img src={result.data.thumbnail} className="w-12 h-16 rounded-lg object-cover" alt="cover" />
                        <div className="flex-1 min-w-0">
                          <strong className="block truncate text-sm text-slate-800 dark:text-white">{result.data.title || 'TikTok Video'}</strong>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1" dir="ltr">@{result.data.author}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => downloadItem(result.data.hdUrl || result.data.url, `tiksave-batch-hd-${result.index}.mp4`)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors active:scale-[0.98]"
                        >
                          {t(lang, 'hd_video')}
                        </button>
                        <button 
                          onClick={() => downloadItem(result.data.musicUrl, `tiksave-batch-audio-${result.index}.mp3`)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors active:scale-[0.98]"
                        >
                          {t(lang, 'mp3_audio')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <strong className="block text-red-700 dark:text-red-400 text-sm">{t(lang, 'error')}</strong>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1" dir="ltr">{result.url}</div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">{result.error}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {!isProcessing && results.length > 0 && (
                <div className="p-4 rounded-2xl mt-4 font-bold text-sm text-center bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  {t(lang, 'done')}: {successCount} {t(lang, 'successful')}, {errorCount} {t(lang, 'failed')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <AdPlaceholder type="mrec" />

      {/* How to Use Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-4">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-question-circle text-sky-500"></i>
          {t(lang, 'how_to_use')}
        </h2>
        
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{t(lang, 'step_1_title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t(lang, 'step_1_desc')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{t(lang, 'step_2_title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t(lang, 'batch_desc')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{t(lang, 'step_3_title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t(lang, 'step_3_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
