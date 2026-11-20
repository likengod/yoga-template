import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Image as ImageIcon } from 'lucide-react';
import { siteSettingsService } from '@/services/database';
import ImagePicker from './ImagePicker';

const DEFAULT_FAVICON = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80';

const AdminFavicon = () => {
  const { toast } = useToast();
  const [faviconUrl, setFaviconUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load favicon from database on mount
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.faviconUrl) {
          setFaviconUrl(data.faviconUrl);
        } else {
          const stored = localStorage.getItem('faviconUrl');
          setFaviconUrl(stored || DEFAULT_FAVICON);
        }
      } catch (err) {
        console.error('Failed to load favicon from database:', err);
        const stored = localStorage.getItem('faviconUrl');
        setFaviconUrl(stored || DEFAULT_FAVICON);
      }
    };
    
    loadFavicon();
  }, []);

  const updateFavicon = (url: string) => {
    const existing = document.querySelectorAll('link[rel*="icon"]');
    existing.forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = url;
    document.head.appendChild(link);

    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = url.replace('w=32&h=32', 'w=180&h=180');
    document.head.appendChild(appleLink);
  };

  const handleSaveFavicon = async () => {
    if (!faviconUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select or enter a valid favicon image."
      });
      return;
    }

    setIsSaving(true);
    try {
      const existing = await siteSettingsService.getSettings();
      const payload = existing ? {
        ...existing,
        faviconUrl: faviconUrl
      } : {
        faviconUrl: faviconUrl,
        socialLinks: '{}'
      };
      
      await siteSettingsService.updateSettings(payload);
      localStorage.setItem('faviconUrl', faviconUrl);
      updateFavicon(faviconUrl);
      
      toast({
        title: "Favicon Saved",
        description: "Your website favicon has been updated successfully."
      });
    } catch (err) {
      console.error('Failed to save favicon to database:', err);
      localStorage.setItem('faviconUrl', faviconUrl);
      updateFavicon(faviconUrl);
      toast({
        variant: "destructive",
        title: "Saved Locally",
        description: "Database offline. Favicon applied locally."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    setFaviconUrl(DEFAULT_FAVICON);
    toast({
      title: "Reset",
      description: "Default favicon restored. Click 'Save Favicon' to apply."
    });
  };

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-yoga-forest flex items-center gap-2">
          <ImageIcon size={20} className="text-yoga-sage" />
          <span>Website Favicon</span>
        </CardTitle>
        <CardDescription>
          Customize the small icon that appears in browser tabs and bookmarks.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="faviconUrl" className="text-xs font-semibold text-gray-700 mb-1.5 block">
            Favicon Image
          </Label>

          {/* Simple Row: Live Preview Thumbnail + File Manager ImagePicker */}
          <div className="flex items-center gap-2.5">
            {/* Live square preview icon */}
            <div 
              title="Current Favicon Preview"
              className="w-10 h-10 rounded-md border border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 p-1 shadow-xs"
            >
              <img loading="lazy" 
                src={faviconUrl || DEFAULT_FAVICON} 
                alt="Favicon preview" 
                className="w-6 h-6 object-contain rounded-xs"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FAVICON;
                }}
              />
            </div>

            {/* ImagePicker: opens File Manager modal showing all uploaded images + Upload New */}
            <div className="flex-1">
              <ImagePicker
                id="faviconUrl"
                value={faviconUrl}
                onChange={(url) => setFaviconUrl(url)}
                placeholder="Enter image URL or choose from File Manager"
                buttonText="Upload / Choose Image"
                className="border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white"
              />
            </div>
          </div>
        </div>

        {/* Buttons & Short Helper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveFavicon}
              disabled={isSaving}
              className="bg-yoga-sage hover:bg-yoga-forest text-white h-9 px-4 text-sm font-medium"
            >
              <Save size={15} className="mr-1.5" />
              {isSaving ? "Saving..." : "Save Favicon"}
            </Button>

            <Button
              variant="outline"
              onClick={resetToDefault}
              className="text-gray-600 border-gray-300 hover:bg-gray-100 h-9 px-3 text-sm"
            >
              Reset to Default
            </Button>
          </div>

          <span className="text-xs text-muted-foreground">
            Recommended: <strong>32×32px</strong> PNG or ICO
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFavicon;
