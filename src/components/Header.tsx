import React from 'react';

export default function Header() {
  return (
    <header dir="ltr" className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-center pt-[env(safe-area-inset-top)]">
      <div className="logo-container flex items-center gap-1">
        <i className="fab fa-tiktok text-xl text-slate-900 dark:text-white"></i>
        <span className="tik-text text-xl font-bold">tik</span>
        <i className="fas fa-bolt text-sm text-sky-500 animate-pulse"></i>
        <span className="save-text text-xl font-bold">save</span>
        <span className="pro-text">pro</span>
      </div>
    </header>
  );
}
