import React from 'react';

interface AdPlaceholderProps {
  type: 'banner' | 'large-banner' | 'mrec';
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type, className = '' }) => {
  let width = 320;
  let height = 50;
  let key = '';
  
  if (type === 'banner') {
    key = '9e254ef7021cc1ee32fbb8d9fea69c4a';
    width = 320;
    height = 50;
  } else if (type === 'large-banner') {
    // Fallback to banner if large-banner is not provided
    key = '9e254ef7021cc1ee32fbb8d9fea69c4a';
    width = 320;
    height = 50;
  } else if (type === 'mrec') {
    key = '259a17b1dc4e6f0e590334b578b42c40';
    width = 300;
    height = 250;
  }

  if (!key) return null;

  return (
    <div 
      className={`flex flex-col items-center justify-center mx-auto overflow-hidden ${className}`}
      style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px`, minHeight: `${height}px` }}
    >
      <iframe
        src={`/ad.html?key=${key}&width=${width}&height=${height}`}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ border: 'none', overflow: 'hidden' }}
        title="Advertisement"
      />
    </div>
  );
};
