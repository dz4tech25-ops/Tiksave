import React, { useState } from 'react';
import { t } from '../i18n';
import { AdPlaceholder } from './AdPlaceholder';

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  lang: string;
  setLang: (lang: string) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

export default function Settings({ isDark, toggleTheme, lang, setLang }: SettingsProps) {
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24 pt-8">
      <h2 className="text-xl font-bold px-2 text-slate-800 dark:text-white">{t(lang, 'settings')}</h2>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <i className="fas fa-moon"></i>
            </div>
            <span className="font-medium text-slate-800 dark:text-white">{t(lang, 'dark_mode')}</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? (lang === 'ar' ? '-translate-x-[26px]' : 'translate-x-[26px]') : (lang === 'ar' ? '-translate-x-[2px]' : 'translate-x-[2px]')}`}></div>
          </button>
        </div>

        {/* Language Selection */}
        <div className="p-4">
          <button 
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <i className="fas fa-globe"></i>
              </div>
              <span className="font-medium text-slate-800 dark:text-white">{t(lang, 'language')}</span>
            </div>
            <i className={`fas fa-chevron-${showLanguages ? 'up' : 'down'} text-slate-400`}></i>
          </button>
          
          {showLanguages && (
            <div className="grid grid-cols-2 gap-2 mt-4" dir="ltr">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    document.documentElement.lang = l.code;
                    document.documentElement.dir = l.code === 'ar' ? 'rtl' : 'ltr';
                    setShowLanguages(false);
                  }}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    lang === l.code 
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdPlaceholder type="banner" />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <button 
          onClick={() => setActiveModal('privacy')}
          className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="font-medium text-slate-800 dark:text-white">{t(lang, 'privacy_policy')}</span>
          </div>
          <i className={`fas fa-chevron-${lang === 'ar' ? 'left' : 'right'} text-slate-400`}></i>
        </button>
        <button 
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <i className="fas fa-info-circle"></i>
            </div>
            <span className="font-medium text-slate-800 dark:text-white">{t(lang, 'about_us')}</span>
          </div>
          <i className={`fas fa-chevron-${lang === 'ar' ? 'left' : 'right'} text-slate-400`}></i>
        </button>
      </div>
      
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
        TikSave Pro v1.0.0
      </p>
      
      <AdPlaceholder type="mrec" />

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 slide-up-overlay">
          {/* App Bar */}
          <div className="flex items-center px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
            <button 
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 rounded-full transition-colors"
            >
              <i className={`fas fa-arrow-${lang === 'ar' ? 'right' : 'left'} text-lg`}></i>
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mx-2">
              {activeModal === 'privacy' ? t(lang, 'privacy_policy') : t(lang, 'about_us')}
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              {activeModal === 'privacy' ? (
                <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </h3>
                  <p>
                    {lang === 'ar' 
                      ? 'نحن نحترم خصوصيتك. لا نقوم بجمع أو تخزين أو مشاركة أي بيانات شخصية أو روابط تقوم بتحميلها. تتم جميع عمليات المعالجة بشكل آمن.'
                      : 'We respect your privacy. We do not collect, store, or share any personal data or links you download. All processing is done securely.'}
                  </p>
                  <p>
                    {lang === 'ar'
                      ? 'التطبيق يستخدم خدمات خارجية لجلب الفيديوهات، وهذه الخدمات قد تجمع بيانات الاستخدام الأساسية لتحسين الخدمة.'
                      : 'The app uses third-party services to fetch videos, and these services may collect basic usage data to improve the service.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
                  <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
                    <i className="fas fa-download text-3xl text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    TikSave Pro
                  </h3>
                  <p>
                    {lang === 'ar'
                      ? 'أفضل أداة لتحميل مقاطع فيديو تيك توك بدون علامة مائية، بجودة عالية، وبسرعة فائقة. تم تطوير هذا التطبيق لتوفير تجربة مستخدم سلسة وبسيطة.'
                      : 'The best tool to download TikTok videos without watermark, in high quality, and at lightning speed. This app is developed to provide a seamless and simple user experience.'}
                  </p>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="mb-4 text-slate-500">
                      {lang === 'ar' ? 'هل لديك أسئلة أو اقتراحات؟' : 'Have questions or suggestions?'}
                    </p>
                    <a 
                      href="mailto:cherifroking@gmail.com"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-medium transition-colors"
                    >
                      <i className="fas fa-envelope text-sky-500"></i>
                      {t(lang, 'contact_us')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
