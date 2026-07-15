
import React, { useState, useEffect } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, EyeOff } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { popupService } from '@/services/database';

interface PopupData {
  enabled: boolean;
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
  delay: number;
}

const AdminPopups = () => {
  const { toast } = useToast();
  const [popupData, setPopupData] = useState<PopupData>({
    enabled: true,
    title: "Transform Your Life with Yoga",
    message: "Join thousands who have discovered inner peace and strength through our authentic yoga practices. Start your journey today with a free consultation.",
    buttonText: "Get Free Consultation",
    buttonUrl: "https://wa.me/918777816410?text=Hi! I would like to schedule a free yoga consultation.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    delay: 10000
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopupData();
  }, []);

  const loadPopupData = async () => {
    try {
      setIsLoading(true);
      const data = await popupService.getSettings();
      if (data) {
        setPopupData({
          enabled: data.enabled,
          title: data.title,
          message: data.message,
          buttonText: data.button_text,
          buttonUrl: data.button_url,
          image: data.image || '',
          delay: data.delay
        });
      }
    } catch (error) {
      console.error('AdminPopups: Error loading popup data:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load popup settings from database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await popupService.updateSettings(popupData);
      
      // Clear session storage to allow testing
      sessionStorage.removeItem('popupShown');
      
      toast({
        title: "Popup Settings Saved",
        description: "Your popup configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('AdminPopups: Error saving popup data:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save popup settings. Please try again.",
      });
    }
  };

  const handleInputChange = (field: keyof PopupData, value: string | boolean | number) => {
    setPopupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestPopup = () => {
    // Clear session storage and reload to test popup immediately
    sessionStorage.removeItem('popupShown');
    toast({
      title: "Testing Popup",
      description: "Session cleared. Popup will appear after the delay on page refresh.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Popup</h2>
        </div>
        <AdminLoadingSpinner message="Loading popup settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yoga-forest">Manage Popup</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleTestPopup}
            className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
          >
            <Eye size={16} className="mr-2" />
            Test Popup
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Enable/Disable Popup */}
          <div className="flex items-center space-x-3">
            <Switch
              checked={popupData.enabled}
              onCheckedChange={(checked) => handleInputChange('enabled', checked)}
            />
            <div className="flex items-center space-x-2">
              {popupData.enabled ? (
                <Eye size={16} className="text-green-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
              <Label className="text-base font-medium">
                {popupData.enabled ? 'Popup Enabled' : 'Popup Disabled'}
              </Label>
            </div>
          </div>

          {/* Popup Content */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Popup Title *</Label>
              <Input
                id="title"
                value={popupData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter popup title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={popupData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter popup message"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonText">Button Text *</Label>
                <Input
                  id="buttonText"
                  value={popupData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="Enter button text"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="buttonUrl">Button URL *</Label>
                <Input
                  id="buttonUrl"
                  value={popupData.buttonUrl}
                  onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                  placeholder="Enter button URL"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <div className="mt-1">
                <ImagePicker
                  id="image"
                  value={popupData.image}
                  onChange={(val) => handleInputChange('image', val)}
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="delay">Delay (seconds)</Label>
              <Input
                id="delay"
                type="number"
                min="1"
                max="60"
                value={popupData.delay / 1000}
                onChange={(e) => handleInputChange('delay', parseInt(e.target.value) * 1000 || 10000)}
                placeholder="Enter delay in seconds"
                className="mt-1"
              />
            </div>
          </div>

          {/* Preview */}
          {popupData.image && (
            <div>
              <Label>Image Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 mt-1">
                <img loading="lazy" 
                  src={popupData.image} 
                  alt="Popup preview" 
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleSave}
            className="bg-yoga-sage hover:bg-yoga-forest w-full"
          >
            <Save size={16} className="mr-2" />
            Save Popup Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPopups;
