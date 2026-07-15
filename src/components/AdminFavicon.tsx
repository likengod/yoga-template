
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Image, Upload, RefreshCw, Info } from 'lucide-react';
import { siteSettingsService } from '@/services/database';

const AdminFavicon = () => {
  const { toast } = useToast();
  const [faviconUrl, setFaviconUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Load favicon URL from database on mount
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const data = await siteSettingsService.getSettings();
        if (data && data.faviconUrl) {
          setFaviconUrl(data.faviconUrl);
          setPreviewUrl(data.faviconUrl);
        } else {
          const storedFaviconUrl = localStorage.getItem('faviconUrl');
          if (storedFaviconUrl) {
            setFaviconUrl(storedFaviconUrl);
            setPreviewUrl(storedFaviconUrl);
          } else {
            const defaultFavicon = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80';
            setFaviconUrl(defaultFavicon);
            setPreviewUrl(defaultFavicon);
          }
        }
      } catch (err) {
        console.error('Failed to load favicon from database:', err);
        const storedFaviconUrl = localStorage.getItem('faviconUrl');
        if (storedFaviconUrl) {
          setFaviconUrl(storedFaviconUrl);
          setPreviewUrl(storedFaviconUrl);
        }
      }
    };
    
    loadFavicon();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc)."
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFaviconUrl(dataUrl);
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFavicon = (url: string) => {
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());

    // Add new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/jpeg';
    link.href = url;
    document.head.appendChild(link);

    // Add apple touch icon
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
        description: "Please enter a valid favicon URL."
      });
      return;
    }

    try {
      // Fetch existing site settings to preserve other fields
      const existing = await siteSettingsService.getSettings();
      const payload = existing ? {
        ...existing,
        faviconUrl: faviconUrl
      } : {
        faviconUrl: faviconUrl,
        socialLinks: '{}'
      };
      
      await siteSettingsService.updateSettings(payload);

      // Save to localStorage fallback
      localStorage.setItem('faviconUrl', faviconUrl);
      
      // Update the actual favicon
      updateFavicon(faviconUrl);
      
      // Update preview
      setPreviewUrl(faviconUrl);
      
      toast({
        title: "Favicon Updated",
        description: "The website favicon has been updated successfully on the database."
      });
    } catch (err) {
      console.error('Failed to save favicon to database:', err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save favicon to database. Saved locally instead."
      });
      localStorage.setItem('faviconUrl', faviconUrl);
      updateFavicon(faviconUrl);
      setPreviewUrl(faviconUrl);
    }
  };

  const handlePreview = () => {
    if (faviconUrl.trim()) {
      setPreviewUrl(faviconUrl);
    }
  };

  const resetToDefault = () => {
    const defaultFavicon = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80';
    setFaviconUrl(defaultFavicon);
    setPreviewUrl(defaultFavicon);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image size={20} className="text-yoga-sage" />
            <span>Website Favicon Management</span>
          </CardTitle>
          <CardDescription>
            Customize your website's favicon icon that appears in browser tabs and bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Label htmlFor="faviconUrl" className="mb-1 block">Favicon Source</Label>
              <div className="flex gap-2">
                <Input
                  id="faviconUrl"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="Enter favicon URL or upload file"
                  className="flex-1"
                />
                
                <Label htmlFor="favicon-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center h-10 px-4 border border-yoga-sage text-yoga-forest rounded-md hover:bg-yoga-sage hover:text-white transition-colors">
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </div>
                  <input 
                    id="favicon-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </Label>
                
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white h-10"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50 h-10 px-4">
              <Label className="text-sm font-medium m-0">Preview:</Label>
              <img loading="lazy" 
                src={previewUrl} 
                alt="Favicon preview" 
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80';
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveFavicon}
              className="bg-yoga-sage hover:bg-yoga-forest"
            >
              <Save size={16} className="mr-2" />
              Save Favicon
            </Button>
            
            <Button
              variant="outline"
              onClick={resetToDefault}
              className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
            >
              Reset to Default
            </Button>
          </div>

          {/* Important Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Recommended Favicon Size</p>
              <p className="text-xs text-blue-700 mt-0.5">Use a square image: <strong>32×32px</strong> or <strong>64×64px</strong> in PNG, ICO or SVG format for best results across all browsers.</p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default AdminFavicon;
