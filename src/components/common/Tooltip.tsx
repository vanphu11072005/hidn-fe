'use client';

import { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    // shift left tooltip downward to avoid header clipping
    left: 'right-full -top-2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} 
            pointer-events-none`}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg 
            px-4 py-3 min-w-[260px] max-w-lg shadow-lg">
            <div className="whitespace-pre-line break-words">{content}</div>
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform 
                rotate-45 ${
                  position === 'top'
                    ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                    : position === 'bottom'
                    ? 'top-[-4px] left-1/2 -translate-x-1/2'
                    : position === 'left'
                    ? 'right-[-4px] top-4'
                    : 'left-[-4px] top-1/2 -translate-y-1/2'
                }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
