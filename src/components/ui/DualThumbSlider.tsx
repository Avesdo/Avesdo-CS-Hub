import React, { useCallback, useEffect, useState, useRef } from 'react';

// Basic class merge utility if cn is not available
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface DualThumbSliderProps {
  min?: number;
  max?: number;
  value: { warning: number; healthy: number };
  onChange: (value: { warning: number; healthy: number }) => void;
  className?: string;
}

export function DualThumbSlider({
  min = 0,
  max = 100,
  value,
  onChange,
  className,
}: DualThumbSliderProps) {
  const [warningVal, setWarningVal] = useState(value.warning);
  const [healthyVal, setHealthyVal] = useState(value.healthy);
  const warningRef = useRef<HTMLInputElement>(null);
  const healthyRef = useRef<HTMLInputElement>(null);

  // Keep internal state in sync if external props change
  useEffect(() => {
    setWarningVal(value.warning);
    setHealthyVal(value.healthy);
  }, [value]);

  const handleWarningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), healthyVal - 1);
    setWarningVal(val);
    onChange({ warning: val, healthy: healthyVal });
  };

  const handleHealthyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), warningVal + 1);
    setHealthyVal(val);
    onChange({ warning: warningVal, healthy: val });
  };

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  return (
    <div className={cn('relative w-full h-8 flex items-center', className)}>
      {/* Background Track with 3 colored zones */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full overflow-hidden flex">
        <div
          className="bg-rose-500 h-full transition-all duration-200 ease-out"
          style={{ width: `${getPercent(warningVal)}%` }}
        />
        <div
          className="bg-amber-400 h-full transition-all duration-200 ease-out"
          style={{ width: `${getPercent(healthyVal) - getPercent(warningVal)}%` }}
        />
        <div
          className="bg-emerald-500 h-full transition-all duration-200 ease-out"
          style={{ width: `${100 - getPercent(healthyVal)}%` }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={warningVal}
        ref={warningRef}
        onChange={handleWarningChange}
        className="thumb thumb--left absolute top-1/2 -translate-y-1/2 w-full h-2 appearance-none bg-transparent pointer-events-none z-10"
        style={{ '--thumb-color': '#f43f5e' } as React.CSSProperties}
      />

      <input
        type="range"
        min={min}
        max={max}
        value={healthyVal}
        ref={healthyRef}
        onChange={handleHealthyChange}
        className="thumb thumb--right absolute top-1/2 -translate-y-1/2 w-full h-2 appearance-none bg-transparent pointer-events-none z-20"
        style={{ '--thumb-color': '#10b981' } as React.CSSProperties}
      />

      <style>{`
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 22px;
          height: 22px;
          background-color: #fff;
          border: 3px solid var(--thumb-color);
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s;
        }
        .thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .thumb::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
        .thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 22px;
          height: 22px;
          background-color: #fff;
          border: 3px solid var(--thumb-color);
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s;
        }
        .thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .thumb::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
