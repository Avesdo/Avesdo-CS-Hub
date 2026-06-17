import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TruncatedTextProps {
  text: string;
  className?: string;
  tooltipClassName?: string;
}

export function TruncatedText({
  text,
  className = '',
  tooltipClassName = 'bg-slate-100 text-slate-800 border border-slate-200 shadow-xl text-sm px-3 py-2 rounded-md whitespace-nowrap z-[99999] pointer-events-none font-medium',
}: TruncatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (containerRef.current && textRef.current) {
      // For truncate, compare scrollWidth against clientWidth to see if it overflowed horizontally
      const isActuallyTruncated =
        containerRef.current.scrollWidth > containerRef.current.clientWidth;

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
      className="w-full relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={containerRef}
        className={`min-w-0 truncate w-full ${className}`}
      >
        <span ref={textRef}>{text}</span>
      </div>
      {isHovered &&
        isTruncated &&
        createPortal(
          <div
            className={`fixed ${tooltipClassName}`}
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
