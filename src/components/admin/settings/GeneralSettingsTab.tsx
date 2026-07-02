import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Phone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteSettingsData } from '@/config/siteSettings';
import ImagePicker from '../../ImagePicker';

interface GeneralSettingsTabProps {
  settings: SiteSettingsData;
  handleChange: (field: keyof SiteSettingsData, value: string) => void;
}

const GeneralSettingsTab = ({ settings, handleChange }: GeneralSettingsTabProps) => {
  return (
    <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm">
      <AccordionItem value="identity" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Globe className="w-5 h-5 text-yoga-sage" /> Site Identity & Logos
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-4">
          <div className="grid gap-4 max-w-2xl">
            <div>
              <Label>Site Name</Label>
              <Input value={settings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Header Logo URL</Label>
              <div className="mt-1">
                <ImagePicker
                  value={settings.headerLogo}
                  onChange={(val) => handleChange('headerLogo', val)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
            <div>
              <Label>Footer Logo URL</Label>
              <div className="mt-1">
                <ImagePicker
                  value={settings.footerLogo}
                  onChange={(val) => handleChange('footerLogo', val)}
                  placeholder="https://example.com/logo-footer.png"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="contact" className="px-4 border-b-0">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Phone className="w-5 h-5 text-yoga-sage" /> Contact, Location & Socials
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-8">
          {/* Contact Information */}
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm border-b pb-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Phone</Label>
                <Input value={settings.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input value={settings.whatsappNumber} onChange={(e) => handleChange('whatsappNumber', e.target.value)} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label>Collaborations Contact</Label>
                <Input value={settings.collaborationsContact} onChange={(e) => handleChange('collaborationsContact', e.target.value)} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input value={settings.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} placeholder="hello@example.com" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm border-b pb-2">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input value={settings.addressStreet} onChange={(e) => handleChange('addressStreet', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={settings.addressCity} onChange={(e) => handleChange('addressCity', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input value={settings.addressState} onChange={(e) => handleChange('addressState', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>ZIP / Postal Code</Label>
                <Input value={settings.addressZip} onChange={(e) => handleChange('addressZip', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={settings.addressCountry} onChange={(e) => handleChange('addressCountry', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Studio Hours */}
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm border-b pb-2">Studio Hours</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Weekdays</Label>
                <Input value={settings.studioHoursWeekdays} onChange={(e) => handleChange('studioHoursWeekdays', e.target.value)} placeholder="e.g. Monday - Friday: 6:00 AM - 9:00 PM" className="mt-1" />
              </div>
              <div>
                <Label>Saturday</Label>
                <Input value={settings.studioHoursSaturday} onChange={(e) => handleChange('studioHoursSaturday', e.target.value)} placeholder="e.g. Saturday: 7:00 AM - 8:00 PM" className="mt-1" />
              </div>
              <div>
                <Label>Sunday</Label>
                <Input value={settings.studioHoursSunday} onChange={(e) => handleChange('studioHoursSunday', e.target.value)} placeholder="e.g. Sunday: 8:00 AM - 6:00 PM" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4 max-w-2xl">
            <h4 className="font-semibold text-sm border-b pb-2">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Facebook URL</Label>
                <Input value={settings.socialFacebook} onChange={(e) => handleChange('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." className="mt-1" />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={settings.socialInstagram} onChange={(e) => handleChange('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." className="mt-1" />
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input value={settings.socialYoutube} onChange={(e) => handleChange('socialYoutube', e.target.value)} placeholder="https://youtube.com/..." className="mt-1" />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={settings.socialLinkedin} onChange={(e) => handleChange('socialLinkedin', e.target.value)} placeholder="https://linkedin.com/..." className="mt-1" />
              </div>
              <div>
                <Label>Snapchat URL</Label>
                <Input value={settings.socialSnapchat} onChange={(e) => handleChange('socialSnapchat', e.target.value)} placeholder="https://snapchat.com/..." className="mt-1" />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GeneralSettingsTab;
