import React, { useRef, useEffect } from 'react';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type Size = 'sm' | 'md' | 'lg';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  ariaLabel: string;
  position?: Position;
  size?: Size;
  className?: string;
  tabIndex?: number;
  autoFocus?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  ariaLabel,
  position = 'bottom-right',
  size = 'md',
  className = '',
  tabIndex,
  autoFocus,
}) => {
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  const getPositionClasses = (position: Position) => {
    return positionClasses[position];
  };

  const getSizeClasses = (size: Size) => {
    return sizeClasses[size];
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`
        ${className}
        ${getPositionClasses(position)}
        ${getSizeClasses(size)}
        bg-primary hover:bg-brand text-white rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        focus-ring
      `}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {icon || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
    </button>
  );
};
