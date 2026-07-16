import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, Phone, Plus, Trash2, Edit2, Check, X, MapPin, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteSettingsData, LocationData, defaultSiteSettings } from '@/config/siteSettings';
import ImagePicker from '../../ImagePicker';
import { Card } from '@/components/ui/card';

interface GeneralSettingsTabProps {
  settings: SiteSettingsData;
  handleChange: (field: keyof SiteSettingsData, value: any) => void;
}

const GeneralSettingsTab = ({ settings, handleChange }: GeneralSettingsTabProps) => {
  const [locations, setLocations] = useState<LocationData[]>(() => {
    if (settings.locations && settings.locations.length > 0) {
      return settings.locations;
    }
    return [
      {
        id: 'default',
        name: settings.siteName || 'Mumbai Studio',
        phone: settings.contactPhone || '',
        email: settings.contactEmail || '',
        addressStreet: settings.addressStreet || '',
        addressCity: settings.addressCity || '',
        addressState: settings.addressState || '',
        addressZip: settings.addressZip || '',
        addressCountry: settings.addressCountry || '',
        studioHoursWeekdays: settings.studioHoursWeekdays || '',
        studioHoursSaturday: settings.studioHoursSaturday || '',
        studioHoursSunday: settings.studioHoursSunday || '',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.062402127265!2d72.8274719!3d18.9840289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce84fd099517%3A0xe9f70d55e0be30!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
      }
    ];
  });

  useEffect(() => {
    if (settings.locations && settings.locations.length > 0) {
      setLocations(settings.locations);
    }
  }, [settings.locations]);

  const saveLocationsList = (updatedList: LocationData[]) => {
    setLocations(updatedList);
    handleChange('locations', updatedList);

    // Sync first location with global settings fields for backwards compatibility
    if (updatedList.length > 0) {
      const first = updatedList[0];
      handleChange('addressStreet', first.addressStreet);
      handleChange('addressCity', first.addressCity);
      handleChange('addressState', first.addressState);
      handleChange('addressZip', first.addressZip);
      handleChange('addressCountry', first.addressCountry);
      handleChange('studioHoursWeekdays', first.studioHoursWeekdays);
      handleChange('studioHoursSaturday', first.studioHoursSaturday);
      handleChange('studioHoursSunday', first.studioHoursSunday);
      handleChange('contactPhone', first.phone);
      handleChange('contactEmail', first.email);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formWeekdays, setFormWeekdays] = useState('');
  const [formSaturday, setFormSaturday] = useState('');
  const [formSunday, setFormSunday] = useState('');
  const [formMapUrl, setFormMapUrl] = useState('');

  const startEdit = (loc: LocationData) => {
    setEditingId(loc.id);
    setIsAdding(false);
    setFormName(loc.name);
    setFormPhone(loc.phone);
    setFormEmail(loc.email);
    setFormStreet(loc.addressStreet);
    setFormCity(loc.addressCity);
    setFormState(loc.addressState);
    setFormZip(loc.addressZip);
    setFormCountry(loc.addressCountry);
    setFormWeekdays(loc.studioHoursWeekdays);
    setFormSaturday(loc.studioHoursSaturday);
    setFormSunday(loc.studioHoursSunday);
    setFormMapUrl(loc.mapUrl);
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormZip('');
    setFormCountry('');
    setFormWeekdays('');
    setFormSaturday('');
    setFormSunday('');
    setFormMapUrl('');
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const saveForm = () => {
    if (!formName.trim()) return;

    if (isAdding) {
      const newLoc: LocationData = {
        id: Date.now().toString(),
        name: formName,
        phone: formPhone,
        email: formEmail,
        addressStreet: formStreet,
        addressCity: formCity,
        addressState: formState,
        addressZip: formZip,
        addressCountry: formCountry,
        studioHoursWeekdays: formWeekdays,
        studioHoursSaturday: formSaturday,
        studioHoursSunday: formSunday,
        mapUrl: formMapUrl
      };
      saveLocationsList([...locations, newLoc]);
    } else if (editingId) {
      const updatedList = locations.map(loc => {
        if (loc.id === editingId) {
          return {
            ...loc,
            name: formName,
            phone: formPhone,
            email: formEmail,
            addressStreet: formStreet,
            addressCity: formCity,
            addressState: formState,
            addressZip: formZip,
            addressCountry: formCountry,
            studioHoursWeekdays: formWeekdays,
            studioHoursSaturday: formSaturday,
            studioHoursSunday: formSunday,
            mapUrl: formMapUrl
          };
        }
        return loc;
      });
      saveLocationsList(updatedList);
    }

    setEditingId(null);
    setIsAdding(false);
  };

  const deleteLocation = (id: string) => {
    if (locations.length <= 1) {
      alert("You must keep at least one location.");
      return;
    }
    if (confirm(`Are you sure you want to delete this location?`)) {
      const updatedList = locations.filter(loc => loc.id !== id);
      saveLocationsList(updatedList);
    }
  };

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

      <AccordionItem value="locations" className="px-4 border-b">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <MapPin className="w-5 h-5 text-yoga-sage" /> Manage Locations & Maps
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-6">
          {editingId || isAdding ? (
            /* Inline Add/Edit Form */
            <div className="bg-yoga-cream/30 p-4 rounded-xl border border-yoga-sage/20 space-y-4 max-w-2xl">
              <h4 className="font-semibold text-yoga-forest border-b pb-2">
                {isAdding ? 'Add New Location' : 'Edit Location'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Location / Studio Name</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Mumbai Studio" className="mt-1" required />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 87778 16410" className="mt-1" />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="info@example.com" className="mt-1" />
                </div>

                <div className="md:col-span-2 border-t pt-2 mt-2">
                  <span className="text-xs font-semibold text-yoga-sage">Address Details</span>
                </div>
                <div className="md:col-span-2">
                  <Label>Street Address</Label>
                  <Input value={formStreet} onChange={(e) => setFormStreet(e.target.value)} placeholder="123 Wellness St" className="mt-1" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Mumbai" className="mt-1" />
                </div>
                <div>
                  <Label>State / Province</Label>
                  <Input value={formState} onChange={(e) => setFormState(e.target.value)} placeholder="Maharashtra" className="mt-1" />
                </div>
                <div>
                  <Label>ZIP / Postal Code</Label>
                  <Input value={formZip} onChange={(e) => setFormZip(e.target.value)} placeholder="400001" className="mt-1" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={formCountry} onChange={(e) => setFormCountry(e.target.value)} placeholder="India" className="mt-1" />
                </div>

                <div className="md:col-span-2 border-t pt-2 mt-2">
                  <span className="text-xs font-semibold text-yoga-sage">Studio Hours</span>
                </div>
                <div>
                  <Label>Weekdays Hours</Label>
                  <Input value={formWeekdays} onChange={(e) => setFormWeekdays(e.target.value)} placeholder="Monday - Friday: 6:00 AM - 9:00 PM" className="mt-1" />
                </div>
                <div>
                  <Label>Saturday Hours</Label>
                  <Input value={formSaturday} onChange={(e) => setFormSaturday(e.target.value)} placeholder="Saturday: 7:00 AM - 8:00 PM" className="mt-1" />
                </div>
                <div>
                  <Label>Sunday Hours</Label>
                  <Input value={formSunday} onChange={(e) => setFormSunday(e.target.value)} placeholder="Sunday: 8:00 AM - 6:00 PM" className="mt-1" />
                </div>

                <div className="md:col-span-2 border-t pt-2 mt-2">
                  <span className="text-xs font-semibold text-yoga-sage">Google Maps Integration</span>
                </div>
                <div className="md:col-span-2">
                  <Label>Google Maps Embed URL</Label>
                  <Input value={formMapUrl} onChange={(e) => setFormMapUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className="mt-1" />
                  <p className="text-[10px] text-yoga-forest/60 mt-1">
                    To get this URL: Go to Google Maps &rarr; Search location &rarr; Click Share &rarr; Select "Embed a map" tab &rarr; Copy the source URL inside the `src` attribute of the iframe.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
                <Button onClick={saveForm} className="bg-yoga-sage hover:bg-yoga-forest text-white" disabled={!formName.trim()}>
                  Save Location
                </Button>
              </div>
            </div>
          ) : (
            /* Locations List view */
            <div className="space-y-4 max-w-4xl">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-yoga-forest">Configured Locations</h4>
                <div className="flex gap-2">
                  <Button type="button" onClick={startAdd} size="sm" className="bg-yoga-sage hover:bg-yoga-forest text-white text-xs h-9">
                    <Plus size={14} className="mr-1" /> Add Location
                  </Button>
                </div>
              </div>

              {locations.length === 0 ? (
                <p className="text-sm text-yoga-forest/60 text-center py-4">No locations added yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {locations.map((loc, idx) => (
                    <Card key={loc.id} className="p-4 border shadow-sm relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-yoga-forest text-sm">{loc.name} {idx === 0 && <span className="text-[10px] bg-yoga-sage/20 text-yoga-sage px-1.5 py-0.5 rounded font-normal ml-2">Primary</span>}</h5>
                        </div>
                        <p className="text-xs text-yoga-forest/70 mb-1">{loc.addressStreet}, {loc.addressCity}, {loc.addressState} {loc.addressZip}</p>
                        <p className="text-xs text-yoga-forest/70 mb-1">Phone: {loc.phone || 'N/A'}</p>
                        <p className="text-xs text-yoga-forest/70">Email: {loc.email || 'N/A'}</p>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-4 pt-2 border-t">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(loc)} className="h-8 px-2 text-yoga-sage hover:text-yoga-forest">
                          <Edit2 size={12} className="mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteLocation(loc.id)} className="h-8 px-2 text-red-500 hover:text-red-700" disabled={locations.length <= 1}>
                          <Trash2 size={12} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="social" className="px-4 border-b-0">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 font-semibold text-yoga-forest">
            <Phone className="w-5 h-5 text-yoga-sage" /> Global Social Media Links
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 space-y-4">
          <div className="space-y-4 max-w-2xl">
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
