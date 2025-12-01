import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.ico'; // Change this to your file name

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  variant?: 'light' | 'dark';
}

export const Logo = ({ className, showText = true, size = 'md', orientation = 'horizontal', variant }: LogoProps) => {
  const iconSizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn(
      'flex items-center',
      isVertical ? 'flex-col gap-2' : 'flex-row gap-2',
      className
    )}>
      {/* Logo Image */}
      <div 
        className={cn('relative flex-shrink-0', iconSizes[size])}
        style={{
          position: 'relative',
        }}
      >
        {/* Subtle Gradient Glow Behind Logo */}
        <div
          style={{
            position: 'absolute',
            inset: '-3px',
            background: 'linear-gradient(135deg, rgba(161, 143, 255, 0.4) 0%, rgba(152, 243, 254, 0.3) 100%)',
            borderRadius: '12px',
            filter: 'blur(6px)',
            zIndex: 0,
            opacity: 0.6,
          }}
        />
        {/* Logo Image Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 1,
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img 
            src={logoImage} 
            alt="TestWise Logo" 
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(161, 143, 255, 0.4)) drop-shadow(0 0 12px rgba(152, 243, 254, 0.3))',
              position: 'relative',
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </div>
      </div>
      
      {/* Text */}
      {showText && (
        <span 
          className={cn(
            textSizes[size],
            isVertical && 'text-center'
          )}
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #2E1869 0%, #5B21B6 50%, #A18FFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: variant === 'light' ? '0 2px 8px rgba(255, 255, 255, 0.3)' : 'none',
          }}
        >
          TestWise
        </span>
      )}
    </div>
  );
};