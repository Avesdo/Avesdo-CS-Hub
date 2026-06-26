import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TruncatedTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
  tooltipClassName?: string;
}

export function TruncatedText({
  text,
  className = '',
  containerClassName = 'w-full',
  tooltipClassName = 'bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 shadow-xl text-xs px-3 py-2 rounded-md whitespace-nowrap z-[99999] pointer-events-none font-medium',
}: TruncatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (containerRef.current && textRef.current) {
      // A highly robust way to check truncation is comparing the raw text width to the container width.
      const textWidth = textRef.current.getBoundingClientRect().width;
      const containerWidth = containerRef.current.getBoundingClientRect().width;

      const isActuallyTruncated =
        containerRef.current.scrollWidth > containerRef.current.clientWidth ||
        textWidth > containerWidth;

      setIsTruncated(isActuallyTruncated);

      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left,
        y: rect.top - 8,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`${containerClassName} relative flex items-center`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={containerRef} className={`min-w-0 truncate w-full ${className}`}>
        <span ref={textRef}>{text}</span>
      </div>
      {isHovered &&
        isTruncated &&
        createPortal(
          <div
            className={`fixed ${tooltipClassName} animate-in fade-in zoom-in-95 duration-100`}
            style={{
              top: coords.y,
              left: coords.x,
              transform: 'translateY(-100%)',
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
}
