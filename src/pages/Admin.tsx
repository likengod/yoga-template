import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/AdminPanel';
import { Loader2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserMenu from '@/components/UserMenu';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Add a small delay to prevent immediate redirects on refresh
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Check if user has admin or superadmin role
          if (user.role === 'admin' || user.role === 'superadmin') {
            setCurrentUser(user);
          } else {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You need admin or super admin privileges to access this page.",
            });
            navigate('/', { replace: true });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Login Required",
            description: "Please login with admin credentials to access this page.",
          });
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to prevent flash of redirect on refresh
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/', { replace: true });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yoga-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no user or wrong permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yoga-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yoga-forest mb-4">Access Denied</h1>
          <p className="text-yoga-forest/70 mb-4">You need admin or super admin privileges to access this page.</p>
          <Button onClick={() => navigate('/', { replace: true })} className="bg-yoga-sage hover:bg-yoga-forest">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yoga-cream flex flex-col w-full">
      {/* Admin Panel Content */}
      <div className="flex-1 flex w-full">
        <AdminPanel currentUser={currentUser} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Admin;
