import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export const LogoutDialog = ({ open, onOpenChange, onConfirm }: LogoutDialogProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debug: Log when dialog opens/closes
  React.useEffect(() => {
    console.log('LogoutDialog open state:', open);
  }, [open]);

  const handleConfirm = async () => {
    console.log('Logout confirmed, starting logout process');
    try {
      setIsLoggingOut(true);
      await onConfirm();
      console.log('Logout completed, closing dialog');
      onOpenChange(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Close dialog even if there's an error
      onOpenChange(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isLoggingOut) {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent 
        className="sm:max-w-md !my-0 !top-[100px]"
        hideCloseButton={true}
        onEscapeKeyDown={(e) => {
          if (!isLoggingOut) {
            onOpenChange(false);
          } else {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (!isLoggingOut) {
            onOpenChange(false);
          } else {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (!isLoggingOut) {
            onOpenChange(false);
          } else {
            e.preventDefault();
          }
        }}
        style={{
          position: 'fixed',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '0 auto',
          borderRadius: '16px',
          padding: '32px 24px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          maxWidth: '400px',
        }}
      >
        {/* Question Text */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          paddingTop: '8px',
        }}>
          <p style={{
            fontSize: '18px',
            fontWeight: 500,
            color: '#4A5568',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: '1.5',
            margin: 0,
          }}>
            Are you sure, you want to logout?
          </p>
        </div>

        {/* Buttons - Horizontal Layout */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Cancel Button - Text Only */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              padding: '12px 24px',
              transition: 'all 0.2s',
              opacity: isLoggingOut ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.color = '#64748B';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.color = '#94A3B8';
              }
            }}
          >
            Cancel
          </button>

          {/* Logout Button - Filled Light Blue/Teal */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            style={{
              background: isLoggingOut ? '#60A5FA' : '#4FD1C7',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              padding: '12px 32px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(79, 209, 199, 0.3)',
              opacity: isLoggingOut ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = '#38B2AC';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 209, 199, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.background = '#4FD1C7';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 209, 199, 0.3)';
              }
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

