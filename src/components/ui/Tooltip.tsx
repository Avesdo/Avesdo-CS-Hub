import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right';
  className?: string;
  containerClassName?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  containerClassName = 'inline-flex',
}: TooltipProps) {
  if (!content) return <>{children}</>;

  let positionClasses = '';
  switch (position) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      break;
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
      break;
    case 'left':
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
      break;
    case 'right':
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
      break;
    case 'bottom-right':
      positionClasses = 'top-full right-0 mt-2';
      break;
  }

  return (
    <div className={`group/tooltip relative ${containerClassName}`}>
      {children}
      <div
        className={`absolute ${positionClasses} bg-slate-100 text-slate-800 border border-slate-200 shadow-lg text-sm px-3 py-2 rounded-md whitespace-nowrap z-[200] pointer-events-none font-medium opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 ${className}`}
      >
        {content}
      </div>
    </div>
  );
}
