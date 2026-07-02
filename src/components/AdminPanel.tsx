import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Edit, FileText, Image, MessageSquare, Users, Calendar, BarChart3, Home, Settings, Eye, UserCog, Plus, Trash2, X, RefreshCw, Trash, Search, Video, ShoppingCart, DownloadCloud, FolderOpen } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserMenu from '@/components/UserMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminArticles from './AdminArticles';
import AdminGallery from './AdminGallery';
import AdminPopups from './AdminPopups';
import AdminAbout from './AdminAbout';
import AdminContact from './AdminContact';
import AdminInstructors from './AdminInstructors';
import AdminBookings from './AdminBookings';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminSEO from './AdminSEO';
import AdminClasses from './AdminClasses';
import AdminEvents from './AdminEvents';
import AdminProducts from './AdminProducts';
import AdminUpdate from './AdminUpdate';
import AdminSiteSettings from './AdminSiteSettings';
import AdminFileManager from './AdminFileManager';
import AdminHome from './AdminHome';

interface AdminPanelProps {
  currentUser: {
    role: string;
    id: string;
    username: string;
  };
  onLogout: () => void;
}

const AdminPanel = ({ currentUser, onLogout }: AdminPanelProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleClearCache = () => {
    // Clear all website cache
    const cacheKeys = ['fullPrograms', 'programs', 'programsSection', 'heroImage', 'aboutContent', 'aboutSectionContent', 'instructors', 'galleryImages', 'popupSettings', 'contactContent', 'articles', 'bookings', 'onlineClasses'];
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear session storage as well
    sessionStorage.clear();

    // Trigger storage event to update components
    window.dispatchEvent(new Event('storage'));
    toast({
      title: "Cache Cleared",
      description: "All website cache has been cleared successfully."
    });
  };

  const handleRefreshWebsite = () => {
    // Force reload the entire page
    window.location.reload();
  };

  const sidebarItems = [{
    title: "Dashboard",
    icon: BarChart3,
    id: "dashboard"
  }, {
    title: "People & Management",
    items: [
    ...(currentUser.role === 'admin' || currentUser.role === 'superadmin' ? [{
      title: "User",
      icon: UserCog,
      id: "users"
    }] : []), {
      title: "Instructors",
      icon: Users,
      id: "instructors"
    }, {
      title: "Bookings",
      icon: Calendar,
      id: "bookings"
    }]
  }, {
    title: "Classes & Events",
    items: [{
      title: "Online Classes",
      icon: Video,
      id: "classes"
    }, {
      title: "Events",
      icon: Calendar,
      id: "events"
    }]
  }, {
    title: "Content Management",
    items: [{
      title: "Home Page",
      icon: Home,
      id: "hero"
    }, {
      title: "About",
      icon: FileText,
      id: "about"
    }, {
      title: "Contact",
      icon: MessageSquare,
      id: "contact"
    }]
  }, {
    title: "Media & Content",
    items: [{
      title: "File Manager",
      icon: FolderOpen,
      id: "files"
    }, {
      title: "Articles",
      icon: FileText,
      id: "articles"
    }, {
      title: "Gallery",
      icon: Image,
      id: "gallery"
    }, {
      title: "Products",
      icon: ShoppingCart,
      id: "products"
    }, {
      title: "Popups",
      icon: MessageSquare,
      id: "popups"
    }]
  }, {
    title: "SEO & Settings",
    items: [{
      title: "Site Settings",
      icon: Settings,
      id: "site-settings"
    }, {
      title: "SEO Settings",
      icon: Search,
      id: "seo"
    }, {
      title: "System Updates",
      icon: RefreshCw,
      id: "updates"
    }]
  }];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="space-y-6">
            <AdminDashboard />
            
            {/* Cache Management Section */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings size={20} className="text-yoga-sage" />
                <h2 className="text-xl font-semibold text-yoga-forest">Website Management</h2>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleClearCache} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash size={16} className="mr-2" />
                  Clear Website Cache
                </Button>
                
                <Button onClick={handleRefreshWebsite} className="bg-yoga-sage hover:bg-yoga-forest">
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Website
                </Button>
              </div>
              
              <p className="text-sm text-yoga-forest/70 mt-4">
                Clear cache and refresh if changes aren't appearing correctly.
              </p>
            </Card>
          </div>;
      case 'hero':
        return <AdminHome />;
      case 'instructors':
        return <AdminInstructors />;
      case 'bookings':
        return <AdminBookings />;
      case 'articles':
        return <AdminArticles />;
      case 'gallery':
        return <AdminGallery />;
      case 'files':
        return <AdminFileManager />;
      case 'products':
        return <AdminProducts />;
      case 'popups':
        return <AdminPopups />;
      case 'about':
        return <AdminAbout />;
      case 'contact':
        return <AdminContact />;
      case 'users':
        return <AdminUsers currentUser={currentUser} />;
      case 'site-settings':
        return <AdminSiteSettings />;
      case 'seo':
        return <AdminSEO />;
      case 'classes':
        return <AdminClasses />;
      case 'events':
        return <AdminEvents />;
      case 'updates':
        return <AdminUpdate />;
      default:
        return <AdminDashboard />;
    }
  };

  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-6 border-b border-yoga-sage/20 bg-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 shrink-0">
                  <img loading="lazy" src="/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-lg font-bold text-yoga-forest leading-tight whitespace-nowrap truncate">SHAKTI YOGA THEME</h1>
              </div>
              <p className="text-sm text-yoga-forest/70 font-medium">Admin Panel</p>
            </div>
            
            {sidebarItems.map((section, index) => <SidebarGroup key={index}>
                {section.title && !section.items && <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => setActiveTab(section.id)} isActive={activeTab === section.id}>
                        <section.icon />
                        <span>{section.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>}
                
                {section.items && <>
                    <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map(item => <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton onClick={() => setActiveTab(item.id)} isActive={activeTab === item.id}>
                              <item.icon />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>)}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </>}
              </SidebarGroup>)}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 bg-yoga-cream/30">
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-yoga-sage/20 sticky top-0 z-40">
            <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4 text-yoga-forest hover:bg-yoga-sage/10" />
                <h2 className="font-semibold text-yoga-forest text-lg hidden sm:block">Dashboard Overview</h2>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex text-yoga-forest border-yoga-sage/30 hover:bg-yoga-sage/10 rounded-full px-4 whitespace-nowrap"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 sm:mr-2 shrink-0" />
                  <span className="hidden sm:inline font-medium">Back to Website</span>
                </Button>
                <UserMenu user={currentUser} onLogout={onLogout} isAdminPage={true} />
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>;
};

export default AdminPanel;
