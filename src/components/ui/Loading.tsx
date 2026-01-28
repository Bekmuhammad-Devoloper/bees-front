import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  className = '',
  text 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizes[size]} animate-heartbeat`}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-red-500 drop-shadow-lg"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      {text && <p className="mt-3 text-gray-500 text-sm font-medium">{text}</p>}
    </div>
  );
};

export const PageLoading: React.FC<{ text?: string }> = ({ text = "Yuklanmoqda..." }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loading size="lg" text={text} />
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);
