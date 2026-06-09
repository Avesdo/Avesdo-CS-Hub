import React, { useRef, useState } from 'react';

interface TruncatedTextProps {
    text: string;
    className?: string;
    tooltipClassName?: string;
}

export function TruncatedText({ 
    text, 
    className = "", 
    tooltipClassName = "absolute bottom-full left-4 mb-2 bg-white border border-slate-200 shadow-md text-slate-700 text-xs px-2.5 py-1.5 rounded whitespace-nowrap z-50 pointer-events-none" 
}: TruncatedTextProps) {
    const textRef = useRef<HTMLDivElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (textRef.current) {
            setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
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
            <div ref={textRef} className={`truncate w-full ${className}`}>
                {text}
            </div>
            {isHovered && isTruncated && (
                <div className={tooltipClassName}>
                    {text}
                </div>
            )}
        </div>
    );
}
