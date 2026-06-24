import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!content) return <>{children}</>;

  let positionStyles: React.CSSProperties = {};
  switch (position) {
    case 'top':
      positionStyles = { top: coords.y - 8, left: coords.x + coords.width / 2, transform: 'translate(-50%, -100%)' };
      break;
    case 'bottom':
      positionStyles = { top: coords.y + coords.height + 8, left: coords.x + coords.width / 2, transform: 'translateX(-50%)' };
      break;
    case 'left':
      positionStyles = { top: coords.y + coords.height / 2, left: coords.x - 8, transform: 'translate(-100%, -50%)' };
      break;
    case 'right':
      positionStyles = { top: coords.y + coords.height / 2, left: coords.x + coords.width + 8, transform: 'translateY(-50%)' };
      break;
    case 'bottom-right':
      // Align the right edge of the tooltip with the right edge of the trigger
      positionStyles = { top: coords.y + coords.height + 8, left: coords.x + coords.width, transform: 'translateX(-100%)' };
      break;
  }

  return (
    <div 
      className={containerClassName} 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isHovered && createPortal(
        <div
          className={`fixed bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm px-3 py-2 rounded-xl whitespace-nowrap z-[99999] pointer-events-none font-medium animate-in fade-in zoom-in-95 duration-150 ${className}`}
          style={positionStyles}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
