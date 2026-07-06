import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TruncatedTextProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function TruncatedText({
  text,
  children,
  className = '',
  containerClassName = 'w-full',
}: TruncatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0 });

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
        width: rect.width,
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
        <span ref={textRef}>{children || text}</span>
      </div>
      {isHovered &&
        isTruncated &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: coords.y,
              left: coords.x + coords.width / 2,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {/* Arrow */}
            <div
              className="absolute w-3 h-3 bg-white rotate-45 z-20 border-b border-r border-slate-200"
              style={{ bottom: '-6px', left: '50%', marginLeft: '-6px' }}
            />
            {/* Tooltip Body */}
            <div className="relative bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm px-3 py-2 rounded-xl max-w-xs break-words font-medium">
              <div className="relative z-10">{text}</div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
