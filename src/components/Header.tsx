
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import UserMenu from './UserMenu';
import BookingDialog from './BookingDialog';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';

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
    const loadSettings = () => {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        try {
          const parsed = { ...defaultSiteSettings, ...JSON.parse(stored) };
          setSiteSettings(parsed);
          
          // Apply Meta tags globally
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
        } catch (e) {
          console.error(e);
        }
      }
    };
    
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
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about-us' },
    { name: 'Classes', href: '/classes' },
    { name: 'Store', href: '/store' },
    { name: 'Articles', href: '/articles' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Instructors', href: '/instructors' },
    { name: 'Contact', href: '/contact' }
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
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 lg:w-12 lg:h-12">
              <img loading="lazy" src={siteSettings.headerLogo} alt={`${siteSettings.siteName} Logo`} className="w-full h-full object-contain" />
            </div>
            <div>
              <Link to="/" className="text-lg lg:text-2xl font-bold text-yoga-forest hover:text-yoga-terracotta transition-colors whitespace-nowrap truncate max-w-[200px] sm:max-w-none inline-block">
                <span className="hidden sm:inline">{siteSettings.siteName}</span>
                <span className="sm:hidden">{siteSettings.siteName.split(' ')[0]}</span>
              </Link>
            </div>
          </div>

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
            <Button 
              onClick={() => setIsBookingOpen(true)} 
              className="bg-yoga-sage hover:bg-yoga-forest text-white transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Book a Class
            </Button>
            {currentUser ? <UserMenu user={currentUser} onLogout={handleLogout} /> : <LoginDialog onLoginSuccess={handleLoginSuccess} />}
          </div>

          {/* Mobile Actions: UserMenu & Hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            {currentUser ? <UserMenu user={currentUser} onLogout={handleLogout} /> : <LoginDialog onLoginSuccess={handleLoginSuccess} />}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-yoga-forest hover:text-yoga-terracotta transition-colors bg-yoga-sage/10 rounded-full">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-yoga-cream border-l-yoga-sage/20 w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-6 mt-12">
                  <div className="flex flex-col space-y-4">
                    {navItems.map(item => (
                      <Link 
                        key={item.name} 
                        to={item.href} 
                        className="text-lg font-playfair text-yoga-forest hover:text-yoga-terracotta transition-colors border-b border-yoga-sage/10 pb-2" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setIsBookingOpen(true);
                      setIsMenuOpen(false);
                    }} 
                    className="w-full bg-yoga-sage hover:bg-yoga-forest text-white shadow-md text-lg h-12"
                  >
                    Book a Class
                  </Button>
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
