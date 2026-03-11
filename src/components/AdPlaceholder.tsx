import React from 'react';

interface AdPlaceholderProps {
  type: 'banner' | 'large-banner' | 'mrec';
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type, className = '' }) => {
  let width = '320px';
  let height = '50px';
  let label = 'Ad (320x50)';
  
  if (type === 'large-banner') {
    height = '100px';
    label = 'Ad (320x100)';
  } else if (type === 'mrec') {
    width = '300px';
    height = '250px';
    label = 'Ad (300x250)';
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-mono rounded-xl mx-auto overflow-hidden ${className}`}
      style={{ width: '100%', maxWidth: width, height, minHeight: height }}
    >
      <i className="fas fa-ad mb-1 opacity-50"></i>
      {label}
    </div>
  );
};
