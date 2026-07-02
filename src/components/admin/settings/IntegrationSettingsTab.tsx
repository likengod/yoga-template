import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Key, CreditCard, Server, Code } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteSettingsData } from '@/config/siteSettings';

interface IntegrationSettingsTabProps {
  settings: SiteSettingsData;
  handleChange: (field: keyof SiteSettingsData, value: string) => void;
}

const IntegrationSettingsTab = ({ settings, handleChange }: IntegrationSettingsTabProps) => {
  return (
    <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm">
      <AccordionItem value="verification" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Globe className="w-5 h-5 text-yoga-sage" /> Site Verification
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-4">
          <div className="grid gap-4 max-w-2xl">
            <div>
              <Label>Google Site Verification Code</Label>
              <Input value={settings.googleSiteVerification} onChange={(e) => handleChange('googleSiteVerification', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Bing Site Verification Code</Label>
              <Input value={settings.bingSiteVerification} onChange={(e) => handleChange('bingSiteVerification', e.target.value)} className="mt-1" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="auth" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Key className="w-5 h-5 text-yoga-sage" /> Authentication Providers
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-6">
          <div className="space-y-4 border-b pb-4 max-w-2xl">
            <h4 className="font-semibold text-sm">Google Auth</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client ID</Label>
                <Input value={settings.googleAuthClientId} onChange={(e) => handleChange('googleAuthClientId', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Client Secret</Label>
                <Input type="password" value={settings.googleAuthSecret} onChange={(e) => handleChange('googleAuthSecret', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 border-b pb-4 max-w-2xl">
            <h4 className="font-semibold text-sm">Facebook Auth</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>App ID</Label>
                <Input value={settings.facebookAuthAppId} onChange={(e) => handleChange('facebookAuthAppId', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>App Secret</Label>
                <Input type="password" value={settings.facebookAuthSecret} onChange={(e) => handleChange('facebookAuthSecret', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm">LinkedIn Auth</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client ID</Label>
                <Input value={settings.linkedinAuthClientId} onChange={(e) => handleChange('linkedinAuthClientId', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Client Secret</Label>
                <Input type="password" value={settings.linkedinAuthSecret} onChange={(e) => handleChange('linkedinAuthSecret', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="payment" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <CreditCard className="w-5 h-5 text-yoga-sage" /> Payment Gateways
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm">Razorpay Integration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Key ID</Label>
                <Input value={settings.razorpayKeyId || ''} onChange={(e) => handleChange('razorpayKeyId', e.target.value)} className="mt-1" placeholder="rzp_..." />
              </div>
              <div>
                <Label>Key Secret</Label>
                <Input type="password" value={settings.razorpayKeySecret || ''} onChange={(e) => handleChange('razorpayKeySecret', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="firebase" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Server className="w-5 h-5 text-yoga-sage" /> Firebase Configuration
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <Label>API Key</Label>
              <Input type="password" value={settings.firebaseApiKey} onChange={(e) => handleChange('firebaseApiKey', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Auth Domain</Label>
              <Input value={settings.firebaseAuthDomain} onChange={(e) => handleChange('firebaseAuthDomain', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Project ID</Label>
              <Input value={settings.firebaseProjectId} onChange={(e) => handleChange('firebaseProjectId', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Storage Bucket</Label>
              <Input value={settings.firebaseStorageBucket} onChange={(e) => handleChange('firebaseStorageBucket', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Messaging Sender ID</Label>
              <Input value={settings.firebaseMessagingSenderId} onChange={(e) => handleChange('firebaseMessagingSenderId', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>App ID</Label>
              <Input value={settings.firebaseAppId} onChange={(e) => handleChange('firebaseAppId', e.target.value)} className="mt-1" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="github" className="px-4 border-b-0">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Code className="w-5 h-5 text-yoga-sage" /> GitHub CI/CD
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <Label>Repository Owner</Label>
              <Input value={settings.githubRepoOwner} onChange={(e) => handleChange('githubRepoOwner', e.target.value)} placeholder="e.g., GorillaTech" className="mt-1" />
            </div>
            <div>
              <Label>Repository Name</Label>
              <Input value={settings.githubRepoName} onChange={(e) => handleChange('githubRepoName', e.target.value)} placeholder="e.g., shakti-yoga" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>Personal Access Token</Label>
              <Input type="password" value={settings.githubToken} onChange={(e) => handleChange('githubToken', e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className="mt-1" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default IntegrationSettingsTab;
