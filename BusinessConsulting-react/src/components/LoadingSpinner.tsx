import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'emerald' | 'red';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text = 'טוען...',
  fullScreen = false
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2';
      case 'md':
        return 'w-6 h-6 border-2';
      case 'lg':
        return 'w-8 h-8 border-2';
      case 'xl':
        return 'w-12 h-12 border-4';
      default:
        return 'w-6 h-6 border-2';
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-600 border-t-transparent';
      case 'gray':
        return 'border-gray-600 border-t-transparent';
      case 'white':
        return 'border-white border-t-transparent';
      case 'emerald':
        return 'border-emerald-600 border-t-transparent';
      case 'red':
        return 'border-red-600 border-t-transparent';
      default:
        return 'border-blue-600 border-t-transparent';
    }
  };

  const getTextColorStyles = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'gray':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      case 'emerald':
        return 'text-emerald-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const sizeStyles = getSizeStyles();
  const colorStyles = getColorStyles();
  const textColorStyles = getTextColorStyles();

  const spinner = (
    <div className="flex flex-col items-center space-y-2">
      <div className={`${sizeStyles} ${colorStyles} rounded-full animate-spin`} />
      {text && (
        <p className={`text-sm font-medium ${textColorStyles}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
