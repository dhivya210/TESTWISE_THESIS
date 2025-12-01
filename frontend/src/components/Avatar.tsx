import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = name || 'User';
  const initials = getInitials(displayName);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${className}`}
      style={{
        background: src && !imgError 
          ? 'transparent' 
          : 'linear-gradient(135deg, #A18FFF 0%, #C0A9FE 50%, #EABDFF 100%)',
        color: '#FFFFFF',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 8px rgba(46, 24, 105, 0.2)',
      }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

