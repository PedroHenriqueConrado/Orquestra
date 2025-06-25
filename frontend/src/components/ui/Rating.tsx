import React, { useState } from 'react';

interface RatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
}

const Rating: React.FC<RatingProps> = ({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'md',
  showValue = false,
  label
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const maxRating = 10;
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      if (rating === value) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex flex-col items-start">
      {label && (
        <span className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
      )}
      <div className={`flex items-center ${gapClasses[size]} select-none`}>
        <div 
          className={`flex items-center ${gapClasses[size]}`}
          onMouseLeave={handleMouseLeave}
        >
          {Array.from({ length: maxRating }, (_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= displayValue;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleClick(starValue)}
                onMouseEnter={() => handleMouseEnter(starValue)}
                disabled={readonly}
                aria-label={`Avaliar com ${starValue}`}
                title={`Clique para dar nota ${starValue}`}
                className={`${sizeClasses[size]} transition-transform duration-100 ${
                  readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus:scale-110 outline-none'
                } p-0 bg-transparent border-none`}
                style={{ lineHeight: 0 }}
                tabIndex={readonly ? -1 : 0}
              >
                <svg
                  className={`w-full h-full ${
                    isFilled
                      ? 'text-yellow-400'
                      : hoverValue !== null && starValue <= hoverValue
                        ? 'text-yellow-300'
                        : 'text-gray-300 dark:text-gray-600'
                  } drop-shadow`}
                  viewBox="0 0 24 24"
                  fill={isFilled || (hoverValue !== null && starValue <= hoverValue) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
        {showValue && (
          <span className="ml-2 text-lg font-bold text-gray-800 dark:text-gray-200">
            {displayValue}/10
          </span>
        )}
      </div>
    </div>
  );
};

export default Rating; 