import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Posicionamento do tooltip
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-2 py-1 text-sm rounded shadow-lg transform transition-all duration-200';
    const themeClasses = theme === 'dark'
      ? 'bg-dark-accent text-dark-text'
      : 'bg-gray-900 text-white';

    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2'
    };

    return `${baseClasses} ${themeClasses} ${positionClasses[position]}`;
  };

  // Animação de entrada/saída
  const getAnimationClasses = () => {
    if (!isVisible) return 'opacity-0 scale-95 pointer-events-none';
    return 'opacity-100 scale-100';
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <div
        ref={tooltipRef}
        className={`${getPositionClasses()} ${getAnimationClasses()}`}
        role="tooltip"
      >
        {content}
        <div
          className={`absolute w-2 h-2 transform rotate-45 ${
            theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-900'
          }`}
          style={{
            ...(position === 'top' && { bottom: '-4px', left: '50%', marginLeft: '-4px' }),
            ...(position === 'bottom' && { top: '-4px', left: '50%', marginLeft: '-4px' }),
            ...(position === 'left' && { right: '-4px', top: '50%', marginTop: '-4px' }),
            ...(position === 'right' && { left: '-4px', top: '50%', marginTop: '-4px' })
          }}
        />
      </div>
    </div>
  );
};

export default Tooltip; 