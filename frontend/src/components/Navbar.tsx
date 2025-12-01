import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '@/components/Logo';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LogoutDialog } from '@/components/LogoutDialog';
import { Avatar } from '@/components/Avatar';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          setScrolled(isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to home after logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage manually if logout fails
      sessionStorage.removeItem('testwise_user');
      sessionStorage.removeItem('testwise_user_pending');
      localStorage.removeItem('testwise_user');
      // Navigate anyway
      navigate('/', { replace: true });
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutDialog(true);
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: '80px',
        padding: '0 clamp(16px, 4vw, 64px)',
        background: scrolled
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: scrolled ? 'blur(10px) saturate(150%)' : 'blur(8px) saturate(120%)', /* Reduced blur */
        WebkitBackdropFilter: scrolled ? 'blur(10px) saturate(150%)' : 'blur(8px) saturate(120%)',
        borderBottom: scrolled
          ? '1px solid rgba(161, 143, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: scrolled
          ? '0 4px 24px rgba(46, 24, 105, 0.1)'
          : 'none',
        willChange: scrolled ? 'background, backdrop-filter' : 'auto', /* Optimize will-change */
      }}
    >
      <div className="container mx-auto h-full flex items-center justify-between">
        <Link to="/" className="flex items-center" style={{ marginLeft: '-40px' }}>
          <Logo size="md" orientation="horizontal" />
        </Link>
        
        <div className="flex items-center gap-8">
          {!isMobile && (
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className="text-base font-normal transition-all hover:opacity-80"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                }}
              >
                Home
              </Link>
              <Link 
                to="/help" 
                className="text-base font-normal transition-all hover:opacity-80"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                }}
              >
                Help
              </Link>
              <Link 
                to="/resources" 
                className="text-base font-normal transition-all hover:opacity-80"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                }}
              >
                Resources
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/profile')}
                  className="hover:bg-purple-100/50 rounded-full transition-all flex items-center gap-2"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.username || user?.name || user?.email}
                    size="sm"
                  />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <button 
                  type="button"
                  onClick={handleLogoutClick}
                  className="hover:bg-purple-100/50 rounded-full transition-all flex items-center gap-2 px-4 py-2"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="hover:bg-purple-100/50 rounded-full transition-all"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="rounded-full font-bold"
                  style={{
                    background: '#A18FFF',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#8B7AFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#A18FFF';
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </nav>
  );
};
