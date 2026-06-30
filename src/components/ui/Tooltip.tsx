import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      }
      setIsHovered(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) return <>{children}</>;

  let positionStyles: React.CSSProperties = {};
  let arrowStyles: React.CSSProperties = {};
  let arrowClass = 'absolute w-3 h-3 bg-white rotate-45 z-20';
  let initialAnimation = {};
  let animateAnimation = {};
  let exitAnimation = {};

  switch (position) {
    case 'top':
      positionStyles = {
        top: coords.y - 8,
        left: coords.x + coords.width / 2,
      };
      initialAnimation = { opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-100% + 5px)' };
      animateAnimation = { opacity: 1, scale: 1, x: '-50%', y: '-100%' };
      exitAnimation = { opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-100% + 5px)' };
      arrowStyles = { bottom: '-6px', left: '50%', marginLeft: '-6px' };
      arrowClass += ' border-b border-r border-slate-200';
      break;
    case 'bottom':
      positionStyles = {
        top: coords.y + coords.height + 8,
        left: coords.x + coords.width / 2,
      };
      initialAnimation = { opacity: 0, scale: 0.95, x: '-50%', y: '-5px' };
      animateAnimation = { opacity: 1, scale: 1, x: '-50%', y: '0%' };
      exitAnimation = { opacity: 0, scale: 0.95, x: '-50%', y: '-5px' };
      arrowStyles = { top: '-6px', left: '50%', marginLeft: '-6px' };
      arrowClass += ' border-t border-l border-slate-200';
      break;
    case 'left':
      positionStyles = {
        top: coords.y + coords.height / 2,
        left: coords.x - 8,
      };
      initialAnimation = { opacity: 0, scale: 0.95, x: 'calc(-100% + 5px)', y: '-50%' };
      animateAnimation = { opacity: 1, scale: 1, x: '-100%', y: '-50%' };
      exitAnimation = { opacity: 0, scale: 0.95, x: 'calc(-100% + 5px)', y: '-50%' };
      arrowStyles = { right: '-6px', top: '50%', marginTop: '-6px' };
      arrowClass += ' border-t border-r border-slate-200';
      break;
    case 'right':
      positionStyles = {
        top: coords.y + coords.height / 2,
        left: coords.x + coords.width + 8,
      };
      initialAnimation = { opacity: 0, scale: 0.95, x: '-5px', y: '-50%' };
      animateAnimation = { opacity: 1, scale: 1, x: '0%', y: '-50%' };
      exitAnimation = { opacity: 0, scale: 0.95, x: '-5px', y: '-50%' };
      arrowStyles = { left: '-6px', top: '50%', marginTop: '-6px' };
      arrowClass += ' border-b border-l border-slate-200';
      break;
    case 'bottom-right':
      positionStyles = {
        top: coords.y + coords.height + 8,
        left: coords.x + coords.width,
      };
      initialAnimation = { opacity: 0, scale: 0.95, x: 'calc(-100% + 5px)', y: '-5px' };
      animateAnimation = { opacity: 1, scale: 1, x: '-100%', y: '0%' };
      exitAnimation = { opacity: 0, scale: 0.95, x: 'calc(-100% + 5px)', y: '-5px' };
      arrowStyles = { top: '-6px', right: '12px' };
      arrowClass += ' border-t border-l border-slate-200';
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
      {createPortal(
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={initialAnimation}
              animate={animateAnimation}
              exit={exitAnimation}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`fixed bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm px-3 py-2 rounded-xl whitespace-nowrap z-[99999] pointer-events-none font-medium ${className}`}
              style={positionStyles}
            >
              <div className={arrowClass} style={arrowStyles} />
              <div className="relative z-10">{content}</div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
