import { useState, useEffect } from 'react';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = () => {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        try {
          const parsed = { ...defaultSiteSettings, ...JSON.parse(stored) };
          setSettings(parsed);
        } catch (e) {
          console.error('Error parsing site settings', e);
        }
      }
    };

    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);

  return settings;
};
