
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Image, Upload, RefreshCw } from 'lucide-react';

const AdminFavicon = () => {
  const { toast } = useToast();
  const [faviconUrl, setFaviconUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Load favicon URL from localStorage on mount
  useEffect(() => {
    const storedFaviconUrl = localStorage.getItem('faviconUrl');
    if (storedFaviconUrl) {
      setFaviconUrl(storedFaviconUrl);
      setPreviewUrl(storedFaviconUrl);
    } else {
      // Default yoga-related favicon
      const defaultFavicon = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80';
      setFaviconUrl(defaultFavicon);
      setPreviewUrl(defaultFavicon);
    }
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

  const handleSaveFavicon = () => {
    if (!faviconUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid favicon URL."
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('faviconUrl', faviconUrl);
    
    // Update the actual favicon
    updateFavicon(faviconUrl);
    
    // Update preview
    setPreviewUrl(faviconUrl);
    
    toast({
      title: "Favicon Updated",
      description: "The website favicon has been updated successfully."
    });
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

  // Yoga-related favicon suggestions
  const yogaSuggestions = [
    {
      name: "Yoga Pose Silhouette",
      url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80"
    },
    {
      name: "Lotus Flower",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80"
    },
    {
      name: "Meditation Symbol",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80"
    },
    {
      name: "Om Symbol",
      url: "https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32&q=80"
    }
  ];

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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              We recommend image size (32x32px or 64x64px).
            </p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default AdminFavicon;
