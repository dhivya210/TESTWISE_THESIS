import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { Upload, X } from 'lucide-react';
import { api } from '@/lib/api';

interface RecentEvaluation {
  id: number | string;
  date: string;
  time: string;
  tool: string;
  score: number;
}

export const Profile = () => {
  const { user, logout, clearAllCache } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || user?.organizationName || user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    setEmail(user?.email || '');
    setUsername(user?.username || user?.organizationName || user?.name || '');
    setAvatarUrl(user?.avatarUrl);
  }, [user]);

  // Load recent evaluations
  useEffect(() => {
    const loadRecentEvaluations = async () => {
      setLoadingRecent(true);
      try {
        if (user?.isGuest) {
          // Load from localStorage for guest users
          const stored = localStorage.getItem('testwise_evaluations');
          if (stored) {
            const evaluations: any[] = JSON.parse(stored);
            const recent: RecentEvaluation[] = evaluations
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .slice(0, 5)
              .map((evaluation) => {
                const timestamp = evaluation.timestamp ? new Date(evaluation.timestamp) : new Date();
                const dateStr = timestamp.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                const timeStr = timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                
                return {
                  id: evaluation.id,
                  date: evaluation.date || dateStr,
                  time: timeStr,
                  tool: evaluation.recommendedTool,
                  score: Math.max(evaluation.scores?.selenium || 0, evaluation.scores?.playwright || 0, evaluation.scores?.testim || 0, evaluation.scores?.mabl || 0),
                };
              });
            setRecentEvaluations(recent);
          }
        } else if (user?.id) {
          // Load from API for authenticated users
          try {
            const response = await api.getEvaluations(user.id, 5); // Get latest 5
            // Remove duplicates and sort by date
            const uniqueEvaluations = new Map();
            response.evaluations.forEach((evaluation: any) => {
              if (!uniqueEvaluations.has(evaluation.id)) {
                uniqueEvaluations.set(evaluation.id, evaluation);
              }
            });
            
            const recent: RecentEvaluation[] = Array.from(uniqueEvaluations.values())
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((evaluation: any) => {
                // Parse the date properly - SQLite CURRENT_TIMESTAMP stores UTC time
                // Format is usually 'YYYY-MM-DD HH:MM:SS' without timezone info
                let createdAt: Date;
                if (evaluation.createdAt instanceof Date) {
                  createdAt = evaluation.createdAt;
                } else if (typeof evaluation.createdAt === 'string') {
                  // SQLite DATETIME format: 'YYYY-MM-DD HH:MM:SS' (stored as UTC but without timezone indicator)
                  // If it has 'T' or 'Z', it's ISO format
                  if (evaluation.createdAt.includes('T') || evaluation.createdAt.includes('Z')) {
                    // ISO format with timezone - parse directly
                    createdAt = new Date(evaluation.createdAt);
                  } else {
                    // SQLite format 'YYYY-MM-DD HH:MM:SS' - SQLite stores this as UTC
                    // Add 'Z' to indicate UTC, then JavaScript will convert to local time
                    const utcString = evaluation.createdAt.replace(' ', 'T') + 'Z';
                    createdAt = new Date(utcString);
                  }
                } else {
                  createdAt = new Date();
                }
                
                // Format using local timezone (JavaScript automatically converts UTC to local)
                const dateStr = createdAt.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit'
                });
                const timeStr = createdAt.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                });
                
                return {
                  id: evaluation.id,
                  date: dateStr,
                  time: timeStr,
                  tool: evaluation.recommendedTool,
                  score: Math.max(evaluation.scores?.selenium || 0, evaluation.scores?.playwright || 0, evaluation.scores?.testim || 0, evaluation.scores?.mabl || 0),
                };
              });
            setRecentEvaluations(recent);
          } catch (err) {
            console.error('Failed to load recent evaluations:', err);
            // Fallback to localStorage
            const stored = localStorage.getItem('testwise_evaluations');
            if (stored) {
              const evaluations: any[] = JSON.parse(stored);
              const recent: RecentEvaluation[] = evaluations
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 5)
                .map((evaluation) => {
                  const timestamp = evaluation.timestamp ? new Date(evaluation.timestamp) : new Date();
                  const dateStr = timestamp.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  });
                  const timeStr = timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  });
                  
                  return {
                    id: evaluation.id,
                    date: evaluation.date || dateStr,
                    time: timeStr,
                    tool: evaluation.recommendedTool,
                    score: Math.max(evaluation.scores?.selenium || 0, evaluation.scores?.playwright || 0, evaluation.scores?.testim || 0, evaluation.scores?.mabl || 0),
                  };
                });
              setRecentEvaluations(recent);
            }
          }
        }
      } catch (err) {
        console.error('Error loading recent evaluations:', err);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentEvaluations();
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result); // For now, store as data URL. Later, upload to server
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(undefined);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    // Save avatar URL (for now in localStorage/sessionStorage, later to server)
    if (avatarUrl && user) {
      const updatedUser = { ...user, avatarUrl };
      sessionStorage.setItem('testwise_user', JSON.stringify(updatedUser));
      // Update user context if needed
      window.location.reload(); // Simple refresh to update navbar
    }
    
    toast({
      title: 'Success!',
      description: 'Your changes have been saved.',
    });
  };

  const handleExportData = async () => {
    try {
      let evaluations: any[] = [];
      
      if (user?.isGuest) {
        // Export from localStorage
        const stored = localStorage.getItem('testwise_evaluations');
        if (stored) {
          evaluations = JSON.parse(stored);
        }
      } else if (user?.id) {
        // Export from API
        const response = await api.getEvaluations(user.id, 1000);
        evaluations = response.evaluations;
      }

      if (evaluations.length === 0) {
        toast({
          title: 'No data to export',
          description: 'You have no evaluations to export.',
          variant: 'destructive',
        });
        return;
      }

      // Create export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          email: user?.email,
          username: user?.username || user?.name,
        },
        evaluations,
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `testwise-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful!',
        description: 'Your data has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = () => {
    if (user?.isGuest) {
      toast({
        title: 'Cannot delete guest account',
        description: 'Guest accounts are temporary and cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      // For now, just clear local data
      if (user?.isGuest) {
        localStorage.removeItem('testwise_evaluations');
        sessionStorage.removeItem('testwise_user');
        toast({
          title: 'Account cleared',
          description: 'All local data has been removed.',
        });
        await logout();
        navigate('/');
        window.location.reload();
      } else {
        // For registered users, you'll need to implement a delete endpoint
        toast({
          title: 'Feature coming soon',
          description: 'Account deletion will be available soon.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
    setShowDeleteDialog(false);
  };

  const handleClearAllCache = async () => {
    try {
      await clearAllCache();
      toast({
        title: 'Cache Cleared',
        description: 'All cached data (usernames, emails, passwords, evaluations) has been cleared successfully.',
      });
      // Reload the page to reflect the changes
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to clear cache',
        description: 'An error occurred while clearing cache. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden gradient-bg"
      style={{
        background: 'linear-gradient(135deg, #A18FFF 0%, #C0A9FE 25%, #EABDFF 50%, #98F3FE 75%, #A18FFF 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes drift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(20px) translateY(-10px); }
          50% { transform: translateX(-15px) translateY(15px); }
          75% { transform: translateX(10px) translateY(-5px); }
        }
        
        .gradient-bg {
          animation: gradientShift 15s ease infinite;
        }
        
        .blurred-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: pulse 8s ease-in-out infinite;
        }
        
        .wave-layer {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, rgba(161, 143, 255, 0.1), rgba(152, 243, 254, 0.1));
          border-radius: 45% 55% 60% 40%;
          animation: float 20s ease-in-out infinite;
        }
        
        .reflection-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .ring-3d {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 4px solid transparent;
          background: linear-gradient(45deg, #EABDFF, #98F3FE, #D9AFFE) padding-box,
                      linear-gradient(45deg, #EABDFF, #98F3FE, #D9AFFE) border-box;
          box-shadow: 0 20px 60px rgba(234, 189, 255, 0.4),
                      0 0 40px rgba(152, 243, 254, 0.3),
                      inset 0 0 30px rgba(255, 255, 255, 0.2);
          animation: float 15s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(46, 24, 105, 0.3));
        }
        
        .floating-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          filter: blur(2px);
          animation: drift 12s ease-in-out infinite;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Blurred Shapes */}
        <div 
          className="blurred-shape"
          style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #A18FFF, #C0A9FE)',
            top: '10%',
            left: '5%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '500px',
            height: '500px',
            background: 'linear-gradient(135deg, #EABDFF, #98F3FE)',
            bottom: '10%',
            right: '5%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '350px',
            height: '350px',
            background: 'linear-gradient(135deg, #C0A9FE, #D9AFFE)',
            top: '50%',
            right: '20%',
            animationDelay: '4s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #98F3FE, #A18FFF)',
            bottom: '30%',
            left: '15%',
            animationDelay: '6s',
          }}
        />
        
        {/* Layered Waves */}
        <div 
          className="wave-layer"
          style={{
            top: '-50%',
            left: '-50%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="wave-layer"
          style={{
            top: '-30%',
            right: '-50%',
            animationDelay: '5s',
            animationDuration: '25s',
          }}
        />
        
        {/* Reflection Effect */}
        <div className="reflection-effect" />
        
        {/* 3D Ring Accent Shapes */}
        <div 
          className="ring-3d"
          style={{
            top: '15%',
            right: '10%',
            animationDelay: '0s',
            width: '250px',
            height: '250px',
          }}
        />
        <div 
          className="ring-3d"
          style={{
            width: '180px',
            height: '180px',
            bottom: '25%',
            left: '10%',
            animationDelay: '3s',
            animationDuration: '12s',
          }}
        />
        <div 
          className="ring-3d"
          style={{
            width: '150px',
            height: '150px',
            top: '60%',
            left: '50%',
            animationDelay: '6s',
            animationDuration: '18s',
          }}
        />
        
        {/* Floating Particles */}
        <div 
          className="floating-particle"
          style={{
            width: '8px',
            height: '8px',
            top: '20%',
            left: '30%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '12px',
            height: '12px',
            top: '70%',
            left: '70%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '6px',
            height: '6px',
            top: '40%',
            left: '80%',
            animationDelay: '4s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '10px',
            height: '10px',
            top: '80%',
            left: '25%',
            animationDelay: '6s',
          }}
        />
      </div>

      <Navbar />
      <main className="flex-1 pt-[80px] pb-20 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: '#2E1869',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
              }}
            >
              Profile Settings
            </h1>
            <p
              className="text-base"
              style={{
                color: '#2E1869',
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                fontWeight: 400,
              }}
            >
              Manage your account settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            {/* Account Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className="p-8 rounded-3xl h-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Account Information
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      fontWeight: 400,
                      opacity: 0.9,
                    }}
                  >
                    Update your account details
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                      }}
                    >
                      Username / Organization Name
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={user?.isGuest}
                      placeholder="Your username or organization name"
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF]"
                      style={{
                        color: '#2E1869',
                      }}
                    />
                    {user?.isGuest && (
                      <p
                        className="text-xs"
                        style={{
                          color: '#2E1869',
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          opacity: 0.7,
                        }}
                      >
                        Guest accounts cannot change profile information
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                      }}
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={user?.isGuest || true}
                      className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF]"
                      style={{
                        color: '#2E1869',
                      }}
                    />
                    {user?.isGuest && (
                      <p
                        className="text-xs"
                        style={{
                          color: '#2E1869',
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          opacity: 0.7,
                        }}
                      >
                        Guest accounts cannot change email
                      </p>
                    )}
                  </div>
                  {/* Profile Picture Section */}
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-medium"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                      }}
                    >
                      Profile Picture
                    </Label>
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={avatarPreview || avatarUrl}
                        name={username || user?.email}
                        size="lg"
                      />
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                          disabled={user?.isGuest}
                        />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={user?.isGuest}
                          variant="outline"
                          className="rounded-full"
                          style={{
                            borderColor: '#A18FFF',
                            color: '#2E1869',
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {avatarUrl ? 'Change' : 'Upload'}
                        </Button>
                        {avatarUrl && (
                          <Button
                            type="button"
                            onClick={handleRemoveAvatar}
                            disabled={user?.isGuest}
                            variant="outline"
                            className="rounded-full"
                            style={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={user?.isGuest}
                    className="rounded-full font-bold"
                    style={{
                      background: user?.isGuest ? 'rgba(161, 143, 255, 0.5)' : '#A18FFF',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!user?.isGuest) {
                        e.currentTarget.style.background = '#8B7AFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!user?.isGuest) {
                        e.currentTarget.style.background = '#A18FFF';
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className="p-8 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Quick Actions
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      fontWeight: 400,
                      opacity: 0.9,
                    }}
                  >
                    Common tasks and shortcuts
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start New Evaluation */}
                  <Button
                    onClick={() => navigate('/questionnaire')}
                    className="rounded-xl font-medium h-auto py-4 px-6 flex items-center justify-center gap-2"
                    style={{
                      background: '#A18FFF',
                      color: '#FFFFFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#8B7AFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#A18FFF';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start New Evaluation
                  </Button>

                  {/* View Full History */}
                  <Button
                    onClick={() => navigate('/history')}
                    variant="outline"
                    className="rounded-xl font-medium h-auto py-4 px-6 flex items-center justify-center gap-2"
                    style={{
                      borderColor: '#A18FFF',
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      background: 'rgba(255, 255, 255, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(161, 143, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Full History
                  </Button>

                  {/* Export Data */}
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="rounded-xl font-medium h-auto py-4 px-6 flex items-center justify-center gap-2"
                    style={{
                      borderColor: '#A18FFF',
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      background: 'rgba(255, 255, 255, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(161, 143, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Data
                  </Button>

                  {/* Clear All Cache */}
                  <Button
                    onClick={handleClearAllCache}
                    variant="outline"
                    className="rounded-xl font-medium h-auto py-4 px-6 flex items-center justify-center gap-2"
                    style={{
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      background: 'rgba(255, 255, 255, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Cache
                  </Button>

                  {/* Delete Account */}
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="rounded-xl font-medium h-auto py-4 px-6 flex items-center justify-center gap-2"
                    style={{
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      background: 'rgba(255, 255, 255, 0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div
                className="p-8 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Recent Activity
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      fontWeight: 400,
                      opacity: 0.9,
                    }}
                  >
                    Your recent evaluation activities
                  </p>
                </div>
                {loadingRecent ? (
                  <div className="text-center py-8">
                    <p
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 400,
                        opacity: 0.8,
                      }}
                    >
                      Loading...
                    </p>
                  </div>
                ) : recentEvaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <p
                      className="mb-4"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 400,
                        opacity: 0.8,
                      }}
                    >
                      No recent activity
                    </p>
                    <Button
                      onClick={() => navigate('/questionnaire')}
                      className="rounded-full font-bold"
                      style={{
                        background: '#A18FFF',
                        color: '#FFFFFF',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        border: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#8B7AFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#A18FFF';
                      }}
                    >
                      Start Evaluation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEvaluations.map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="p-4 rounded-xl flex items-center justify-between"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className="font-semibold"
                              style={{
                                color: '#2E1869',
                                fontFamily: "'Inter', 'Montserrat', sans-serif",
                                fontSize: '0.95rem',
                              }}
                            >
                              {evaluation.tool}
                            </span>
                            <span
                              style={{
                                color: '#2E1869',
                                fontFamily: "'Inter', 'Montserrat', sans-serif",
                                fontSize: '0.85rem',
                                opacity: 0.7,
                              }}
                            >
                              Score: {evaluation.score}
                            </span>
                          </div>
                          <div
                            className="text-sm"
                            style={{
                              color: '#2E1869',
                              fontFamily: "'Inter', 'Montserrat', sans-serif",
                              opacity: 0.7,
                            }}
                          >
                            {evaluation.date} at {evaluation.time}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/history')}
                          className="rounded-lg px-4 py-2 text-sm font-bold"
                          style={{
                            background: 'rgba(161, 143, 255, 0.2)',
                            color: '#2E1869',
                            border: '1px solid rgba(161, 143, 255, 0.3)',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {recentEvaluations.length >= 5 && (
                      <Button
                        onClick={() => navigate('/history')}
                        className="w-full rounded-lg font-bold mt-4"
                        style={{
                          background: '#A18FFF',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          border: 'none',
                        }}
                      >
                        View All Evaluations
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(false)}>
          <div
            className="p-6 rounded-3xl max-w-md w-full mx-4"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-xl font-bold mb-2"
              style={{
                color: '#2E1869',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              }}
            >
              Delete Account
            </h3>
            <p 
              className="mb-4"
              style={{
                color: '#2E1869',
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                opacity: 0.8,
              }}
            >
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your evaluations and data.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="outline"
                className="flex-1 rounded-full"
                style={{
                  borderColor: '#A18FFF',
                  color: '#2E1869',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAccount}
                className="flex-1 rounded-full font-bold"
                style={{
                  background: '#ef4444',
                  color: '#FFFFFF',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
