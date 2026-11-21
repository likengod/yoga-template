import { useState, useEffect } from 'react';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';
import { siteSettingsService } from '@/services/database';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        try {
          const parsed = { ...defaultSiteSettings, ...JSON.parse(stored) };
          setSettings(parsed);
        } catch (e) {
          console.error('Error parsing site settings', e);
        }
      }

      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.socialLinks) {
          try {
            const parsed = JSON.parse(data.socialLinks);
            setSettings(prev => ({
              ...defaultSiteSettings,
              ...prev,
              ...parsed,
              siteName: data.businessName || parsed.siteName || prev.siteName || defaultSiteSettings.siteName,
              contactEmail: data.businessEmail || parsed.contactEmail || prev.contactEmail || defaultSiteSettings.contactEmail,
              contactPhone: data.businessPhone || parsed.contactPhone || prev.contactPhone || defaultSiteSettings.contactPhone,
              locations: Array.isArray(parsed.locations) ? parsed.locations : (prev.locations || defaultSiteSettings.locations)
            }));
          } catch {}
        }
      } catch {}
    };

    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);

  return settings;
};
