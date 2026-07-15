
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Phone, Mail, 
  Home, Info, Calendar, BookOpen, ShoppingBag, FileText, Image as ImageIcon, Users, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import UserMenu from './UserMenu';
import BookingDialog from './BookingDialog';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';
import { siteSettingsService } from '@/services/database';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: string;
  } | null>(null);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.socialLinks) {
          try {
            const parsed = JSON.parse(data.socialLinks);
            const merged = {
              ...defaultSiteSettings,
              ...parsed,
              siteName: data.businessName || parsed.siteName || defaultSiteSettings.siteName,
              contactEmail: data.businessEmail || parsed.contactEmail || defaultSiteSettings.contactEmail,
              contactPhone: data.businessPhone || parsed.contactPhone || defaultSiteSettings.contactPhone,
              headerLogo: data.logoUrl || parsed.headerLogo || defaultSiteSettings.headerLogo,
              footerLogo: data.logoUrl || parsed.footerLogo || defaultSiteSettings.footerLogo
            };
            setSiteSettings(merged);
            applyMetaTags(merged);
            return;
          } catch (e) {
            console.error("Failed to parse socialLinks JSON settings", e);
          }
        }
      } catch (err) {
        console.error('Failed to load site settings in Header from database:', err);
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        try {
          const parsed = { ...defaultSiteSettings, ...JSON.parse(stored) };
          setSiteSettings(parsed);
          applyMetaTags(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    };

    function applyMetaTags(parsed: any) {
      document.title = parsed.siteName;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', parsed.metaDescription);
      
      let googleVerification = document.querySelector('meta[name="google-site-verification"]');
      if (parsed.googleSiteVerification) {
        if (!googleVerification) {
          googleVerification = document.createElement('meta');
          googleVerification.setAttribute('name', 'google-site-verification');
          document.head.appendChild(googleVerification);
        }
        googleVerification.setAttribute('content', parsed.googleSiteVerification);
      }
      
      let bingVerification = document.querySelector('meta[name="msvalidate.01"]');
      if (parsed.bingSiteVerification) {
        if (!bingVerification) {
          bingVerification = document.createElement('meta');
          bingVerification.setAttribute('name', 'msvalidate.01');
          document.head.appendChild(bingVerification);
        }
        bingVerification.setAttribute('content', parsed.bingSiteVerification);
      }
    }
    
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);

  const handleWhatsAppContact = (message: string) => {
    const phoneNumber = (siteSettings.whatsappNumber || siteSettings.contactPhone || '').replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLoginSuccess = (user: {
    username: string;
    role: string;
  }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Classes', href: '/classes', icon: Calendar },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Store', href: '/store', icon: ShoppingBag },
    { name: 'Articles', href: '/articles', icon: FileText },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'Instructors', href: '/instructors', icon: Users },
    { name: 'Contact', href: '/contact', icon: MessageSquare }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-yoga-cream/95 backdrop-blur-sm shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-yoga-sage/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm text-yoga-forest">
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span className="text-xs lg:text-sm">{siteSettings.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span className="text-xs lg:text-sm">{siteSettings.contactEmail}</span>
              </div>
            </div>
            <div className="hidden md:block text-yoga-terracotta font-medium text-xs lg:text-sm">
              Transform Your Mind, Body & Soul
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 lg:w-12 lg:h-12">
              <img loading="lazy" src={siteSettings.headerLogo} alt={`${siteSettings.siteName} Logo`} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-base sm:text-lg lg:text-2xl font-bold text-yoga-forest hover:text-yoga-terracotta transition-colors whitespace-nowrap truncate max-w-[180px] sm:max-w-none inline-block">
                {siteSettings.siteName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map(item => (
              <Link 
                key={item.name} 
                to={item.href} 
                className="text-yoga-forest hover:text-yoga-terracotta transition-colors duration-300 font-medium text-sm xl:text-base"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4 shrink-0">
            {currentUser ? <UserMenu user={currentUser} onLogout={handleLogout} /> : <LoginDialog onLoginSuccess={handleLoginSuccess} />}
          </div>

          {/* Mobile Actions: UserMenu & Hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            {currentUser && <UserMenu user={currentUser} onLogout={handleLogout} />}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-yoga-forest hover:text-yoga-terracotta transition-colors bg-yoga-sage/10 rounded-full">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-yoga-cream border-l-yoga-sage/20 w-[300px] sm:w-[400px] flex flex-col justify-between p-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-6 mt-6 overflow-y-auto pr-2">
                  {/* Header Logo in Mobile Menu */}
                  <div className="flex items-center space-x-3 pb-6 border-b border-yoga-sage/20 shrink-0">
                    <img src={siteSettings.headerLogo} alt="Logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-lg text-yoga-forest">{siteSettings.siteName}</span>
                  </div>

                  <div className="flex flex-col space-y-4">
                    {navItems.map(item => (
                      <Link 
                        key={item.name} 
                        to={item.href} 
                        className="text-lg font-playfair text-yoga-forest hover:text-yoga-terracotta transition-colors border-b border-yoga-sage/10 pb-2 flex items-center space-x-3" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5 text-yoga-sage shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Menu Footer (Login / Logout Option) */}
                <div className="border-t border-yoga-sage/20 pt-6 mt-auto">
                  {currentUser ? (
                    <div className="space-y-3">
                      <p className="text-sm text-yoga-forest/70">Logged in as <span className="font-semibold text-yoga-forest">{currentUser.username}</span></p>
                      <Button 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }} 
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Log Out
                      </Button>
                    </div>
                  ) : (
                    <LoginDialog 
                      onLoginSuccess={(user) => {
                        handleLoginSuccess(user);
                        setIsMenuOpen(false);
                      }} 
                      triggerClassName="w-full bg-yoga-sage hover:bg-yoga-forest text-white py-2.5 rounded-xl justify-center items-center flex" 
                      triggerText="Login to Account"
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </header>
  );
};

export default Header;
