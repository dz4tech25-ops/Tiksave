import React, { useState, useEffect } from 'react';
import { fetchTikTokVideoData, forceDownload } from '../services/api';
import JSZip from 'jszip';
import { t } from '../i18n';
import { AdPlaceholder } from './AdPlaceholder';

interface HeroProps {
  lang: string;
}

export default function Hero({ lang }: HeroProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [downloadingState, setDownloadingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.overlay === false) {
        setResult(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const saveToHistory = (videoData: any) => {
    try {
      const stored = localStorage.getItem('ts-history');
      let history = stored ? JSON.parse(stored) : [];
      // Avoid duplicates
      history = history.filter((item: any) => item.url !== videoData.url);
      history.unshift({
        ...videoData,
        date: new Date().toISOString()
      });
      // Keep only last 50
      if (history.length > 50) history = history.slice(0, 50);
      localStorage.setItem('ts-history', JSON.stringify(history));
    } catch (e) {}
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch (e) {
      // fallback
    }
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

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);

    const value = url.trim();
    if (!value || !isValidUrl(value) || !isTikTokUrl(value)) {
      setError(t(lang, 'invalid_url'));
      return;
    }

    setLoading(true);

    try {
      const videoData = await fetchTikTokVideoData(value);
      window.history.pushState({ overlay: true }, '', '');
      setResult(videoData);
      saveToHistory(videoData);
    } catch (err: any) {
      setError(t(lang, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: string, downloadUrl: string, filename: string) => {
    if (result?.isSlideshow && type !== 'audio') {
      alert(t(lang, 'slideshow_alert'));
      setDownloadingState(prev => ({ ...prev, [type]: true }));
      try {
        const zip = new JSZip();
        const promises = result.images.map(async (imgUrl: string, idx: number) => {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          zip.file(`image${idx + 1}.jpg`, blob);
        });
        await Promise.all(promises);
        const content = await zip.generateAsync({type: "blob"});
        const zipUrl = URL.createObjectURL(content);
        await forceDownload(zipUrl, "tiksave-slideshow.zip");
        URL.revokeObjectURL(zipUrl);
      } finally {
        setDownloadingState(prev => ({ ...prev, [type]: false }));
      }
      return;
    }

    setDownloadingState(prev => ({ ...prev, [type]: true }));
    try {
      await forceDownload(downloadUrl, filename);
    } catch (err: any) {
      alert(t(lang, err.message));
    } finally {
      setDownloadingState(prev => ({ ...prev, [type]: false }));
    }
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const M = Math.floor(seconds / 60);
    const S = Math.floor(seconds % 60);
    return `${String(M).padStart(1, '0')}:${String(S).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 pt-8 flex flex-col gap-6">
      <AdPlaceholder type="banner" />
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4 text-center text-slate-800 dark:text-white">{t(lang, 'downloader_title')}</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="off" noValidate>
          <div className="relative">
            <input 
              type="url" 
              inputMode="url" 
              placeholder={t(lang, 'paste_placeholder')}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-4 pr-20 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handlePaste}
              className={`absolute ${lang === 'ar' ? 'left-2' : 'right-2'} top-2 rounded-xl px-4 py-2 text-sm bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium`}
            >
              {t(lang, 'paste_btn')}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-transform text-white font-bold px-6 py-4 shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? t(lang, 'processing') : t(lang, 'download_btn')}
          </button>
        </form>

        {loading && (
          <div className="mt-8 text-center flex flex-col items-center justify-center">
            <div className="loading-spinner inline-block">
              <div style={{top: '8px', left: '8px', animationDelay: '0s'}}></div>
              <div style={{top: '8px', left: '32px', animationDelay: '-0.4s'}}></div>
              <div style={{top: '8px', left: '56px', animationDelay: '-0.8s'}}></div>
              <div style={{top: '32px', left: '8px', animationDelay: '-0.4s'}}></div>
              <div style={{top: '32px', left: '32px', animationDelay: '-0.8s'}}></div>
              <div style={{top: '32px', left: '56px', animationDelay: '-1.2s'}}></div>
              <div style={{top: '56px', left: '8px', animationDelay: '-0.8s'}}></div>
              <div style={{top: '56px', left: '32px', animationDelay: '-1.2s'}}></div>
              <div style={{top: '56px', left: '56px', animationDelay: '-1.6s'}}></div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t(lang, 'processing')}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
      </div>

      <AdPlaceholder type="mrec" className="mt-4" />

      {/* How to Use Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-2">
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
                {t(lang, 'step_2_desc')}
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

      {/* Result Overlay Page */}
      {result && !loading && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 slide-up-overlay">
          {/* App Bar */}
          <div className="flex items-center px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
            <button 
              onClick={() => {
                setResult(null);
                window.history.back();
              }} 
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
            >
              <i className={`fas fa-arrow-${lang === 'ar' ? 'right' : 'left'} text-slate-700 dark:text-slate-300 text-lg`}></i>
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mx-2 truncate flex-1">
              {t(lang, 'downloader_title')}
            </h2>
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800 transition-colors disabled:opacity-50"
              title={t(lang, 'refresh')}
            >
              <i className={`fas fa-sync-alt text-slate-700 dark:text-slate-300 text-lg ${loading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 pb-8 flex flex-col gap-6">
            <AdPlaceholder type="banner" />
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 max-w-md mx-auto w-full">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Video Preview */}
                  <div className="w-32 shrink-0 aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative flex items-center justify-center">
                    {!result.isSlideshow ? (
                      <video 
                        src={result.url} 
                        poster={result.thumbnail} 
                        controls 
                        className="w-full h-full object-contain"
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <>
                        <img src={result.thumbnail} alt="Slideshow cover" className="w-full h-full object-cover blur-md opacity-40 absolute inset-0" />
                        <img src={result.thumbnail} alt="Slideshow cover" className="w-full h-full object-contain relative z-10" />
                        <div className="absolute bottom-1 right-1 z-20 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                          <i className="fas fa-images"></i>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1">
                    <div className="relative">
                      <h3 className={`text-sm font-bold text-slate-800 dark:text-white ${titleExpanded ? '' : 'line-clamp-3'}`}>
                        {result.title}
                      </h3>
                      <button 
                        onClick={() => setTitleExpanded(!titleExpanded)}
                        className="text-sky-500 text-xs mt-1 font-medium"
                      >
                        {titleExpanded ? t(lang, 'show_less') : t(lang, 'show_more')}
                      </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium" dir="ltr">@{result.author}</p>
                    <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-500 mt-2">
                      <span><i className="far fa-clock mr-1"></i>{formatDuration(result.duration)}</span>
                      <span><i className="far fa-eye mr-1"></i>{new Intl.NumberFormat().format(result.views)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={() => handleDownload('hd', result.hdUrl || result.url, `tiksave-hd-${Math.floor(Math.random() * 10000)}.mp4`)}
                    disabled={downloadingState['hd']}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 active:scale-[0.98] transition-transform disabled:opacity-70"
                  >
                    {downloadingState['hd'] ? <span className="btn-spinner border-emerald-500"></span> : <i className="fas fa-video text-lg"></i>}
                    <span className="text-xs font-bold">{t(lang, 'hd_video')}</span>
                  </button>
                  <button 
                    onClick={() => handleDownload('sd', result.url, `tiksave-sd-${Math.floor(Math.random() * 10000)}.mp4`)}
                    disabled={downloadingState['sd']}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 active:scale-[0.98] transition-transform disabled:opacity-70"
                  >
                    {downloadingState['sd'] ? <span className="btn-spinner border-amber-500"></span> : <i className="fas fa-download text-lg"></i>}
                    <span className="text-xs font-bold">{t(lang, 'sd_video')}</span>
                  </button>
                  <button 
                    onClick={() => handleDownload('audio', result.musicUrl, `tiksave-audio-${Math.floor(Math.random() * 10000)}.mp3`)}
                    disabled={downloadingState['audio']}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 active:scale-[0.98] transition-transform disabled:opacity-70"
                  >
                    {downloadingState['audio'] ? <span className="btn-spinner border-blue-500"></span> : <i className="fas fa-music text-lg"></i>}
                    <span className="text-xs font-bold">{t(lang, 'mp3_audio')}</span>
                  </button>
                  <button 
                    onClick={() => handleDownload('cover', result.thumbnail, `tiksave-cover-${Math.floor(Math.random() * 10000)}.jpg`)}
                    disabled={downloadingState['cover']}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 p-3 active:scale-[0.98] transition-transform disabled:opacity-70"
                  >
                    {downloadingState['cover'] ? <span className="btn-spinner border-purple-500"></span> : <i className="fas fa-image text-lg"></i>}
                    <span className="text-xs font-bold">{t(lang, 'cover')}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <AdPlaceholder type="mrec" />
          </div>
        </div>
      )}
    </div>
  );
}
