import React, { useState, useEffect } from 'react';
import { Heart, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ExternalLink, MessageCircle, Globe, PlayCircle, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = () => {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        try {
          setSiteSettings({ ...defaultSiteSettings, ...JSON.parse(stored) });
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);
  const exploreLinks = [{
    name: 'About Us',
    href: '/about-us'
  }, {
    name: 'Our Classes',
    href: '/classes'
  }, {
    name: 'Events',
    href: '/events'
  }, {
    name: 'Instructors',
    href: '/instructors'
  }, {
    name: 'Contact',
    href: '/contact'
  }, {
    name: 'Collaborations',
    href: '/collaborations'
  }];
  const contactCards = [{
    icon: MapPin,
    title: 'Visit Us',
    details: [
      siteSettings.addressStreet,
      `${siteSettings.addressCity}, ${siteSettings.addressState} ${siteSettings.addressZip}`,
      siteSettings.addressCountry
    ].filter(Boolean)
  }, {
    icon: Phone,
    title: 'Call Us',
    details: [siteSettings.contactPhone]
  }, {
    icon: Mail,
    title: 'Email Us',
    details: [siteSettings.contactEmail]
  }];
  
  const socialLinks = [
    ...(siteSettings.socialFacebook ? [{ icon: Facebook, href: siteSettings.socialFacebook, label: 'Facebook' }] : []),
    ...(siteSettings.socialInstagram ? [{ icon: Instagram, href: siteSettings.socialInstagram, label: 'Instagram' }] : []),
    ...(siteSettings.socialYoutube ? [{ icon: Youtube, href: siteSettings.socialYoutube, label: 'YouTube' }] : []),
    ...(siteSettings.socialWhatsapp ? [{ icon: MessageCircle, href: siteSettings.socialWhatsapp, label: 'WhatsApp' }] : []),
    ...(siteSettings.socialLinkedin ? [{ icon: Linkedin, href: siteSettings.socialLinkedin, label: 'LinkedIn' }] : []),
    ...(siteSettings.socialSnapchat ? [{ icon: Globe, href: siteSettings.socialSnapchat, label: 'Snapchat' }] : [])
  ];
  const legalLinks = [{
    name: 'Privacy Policy',
    href: '/privacy-policy'
  }, {
    name: 'Terms & Conditions',
    href: '/terms-conditions'
  }, {
    name: 'Refund Policy',
    href: '/refund-policy'
  }];
  return <footer className="bg-gradient-to-br from-yoga-sage to-yoga-forest text-white">
      {/* Main Content - 4 Column Layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12">
                <img loading="lazy" src={siteSettings.footerLogo} alt={`${siteSettings.siteName} Logo`} className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{siteSettings.siteName}</h3>
                <p className="text-yoga-cream text-sm">Transform • Heal • Grow</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Transform your mind, body, and soul through authentic yoga practices. 
              Join our community of wellness seekers on a journey to inner peace and holistic health.
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map(social => {
                const IconComponent = social.icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" title={`Follow us on ${social.label}`}>
                    <IconComponent size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-white/20 pb-2 inline-block">Explore</h4>
            <ul className="space-y-3">
              {exploreLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/80 hover:text-white transition-colors duration-300 text-sm flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-yoga-cream mr-2 opacity-0 -ml-3 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-white/20 pb-2 inline-block">Legal Info</h4>
            <ul className="space-y-3">
              {legalLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/80 hover:text-white transition-colors duration-300 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Get In Touch */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-white/20 pb-2 inline-block">Get In Touch</h4>
            <div className="space-y-5">
              {contactCards.map(contact => {
                const IconComponent = contact.icon;
                return (
                  <div key={contact.title} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent size={14} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-1 text-yoga-cream">{contact.title}</h5>
                      <div className="space-y-0.5">
                        {contact.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-white/80">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <span>© {new Date().getFullYear()} {siteSettings.siteName} • Dev Partner:</span>
              <a href="https://GorillaTechSolution.com" target="_blank" rel="noopener noreferrer" className="text-yoga-cream hover:text-white transition-colors underline">
                Gorilla Tech Solution
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
