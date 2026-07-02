import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, Phone, Key, Server, Code, Search, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteSettingsData, defaultSiteSettings } from '@/config/siteSettings';
import AdminSEO from './AdminSEO';
import GeneralSettingsTab from './admin/settings/GeneralSettingsTab';
import IntegrationSettingsTab from './admin/settings/IntegrationSettingsTab';

const AdminSiteSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSiteSettings);

  useEffect(() => {
    const stored = localStorage.getItem('siteSettings');
    if (stored) {
      try {
        setSettings({ ...defaultSiteSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to parse site settings from local storage", e);
      }
    }
  }, []);

  const handleChange = (field: keyof SiteSettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    window.dispatchEvent(new Event('siteSettingsUpdated'));
    
    // Update Meta tags for SEO globally
    document.title = settings.siteName;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settings.metaDescription);
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', settings.siteName);
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', settings.metaDescription);

    let googleVerification = document.querySelector('meta[name="google-site-verification"]');
    if (settings.googleSiteVerification) {
      if (!googleVerification) {
        googleVerification = document.createElement('meta');
        googleVerification.setAttribute('name', 'google-site-verification');
        document.head.appendChild(googleVerification);
      }
      googleVerification.setAttribute('content', settings.googleSiteVerification);
    } else if (googleVerification) {
      googleVerification.remove();
    }

    let bingVerification = document.querySelector('meta[name="msvalidate.01"]');
    if (settings.bingSiteVerification) {
      if (!bingVerification) {
        bingVerification = document.createElement('meta');
        bingVerification.setAttribute('name', 'msvalidate.01');
        document.head.appendChild(bingVerification);
      }
      bingVerification.setAttribute('content', settings.bingSiteVerification);
    } else if (bingVerification) {
      bingVerification.remove();
    }

    toast({
      title: 'Settings Saved',
      description: 'Your site settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-yoga-forest">Site Settings</h2>
          <p className="text-yoga-forest/70 text-sm">Manage all your global website configurations.</p>
        </div>
        <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest text-white shrink-0">
          <Save size={16} className="mr-2" />
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border mb-6">
          <TabsTrigger value="general" className="data-[state=active]:bg-yoga-sage/10 data-[state=active]:text-yoga-forest">
            General Identity
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-yoga-sage/10 data-[state=active]:text-yoga-forest">
            Integrations & API
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-yoga-sage/10 data-[state=active]:text-yoga-forest">
            SEO Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <GeneralSettingsTab settings={settings} handleChange={handleChange} />
        </TabsContent>

        <TabsContent value="integrations" className="mt-0">
          <IntegrationSettingsTab settings={settings} handleChange={handleChange} />
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <AdminSEO />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSiteSettings;
