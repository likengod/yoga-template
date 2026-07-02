import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { contactService } from '@/services/database';

const AdminContact = () => {
  const { toast } = useToast();
  
  const [content, setContent] = useState({
    heroTitle: "Get In Touch",
    heroSubtitle: "Ready to begin your yoga journey? We're here to support you every step of the way.",
    address: {
      street: "123 Wellness Street",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      country: "India"
    },
    phone: {
      primary: "+91 87778 16410",
      secondary: "+91 87778 16410",
      whatsapp: "WhatsApp Available"
    },
    email: {
      info: "info@shaktiyogaraai.com",
      classes: "classes@shaktiyogaraai.com",
      support: "support@shaktiyogaraai.com"
    },
    hours: {
      weekdays: "Monday - Friday: 6:00 AM - 9:00 PM",
      saturday: "Saturday: 7:00 AM - 8:00 PM",
      sunday: "Sunday: 8:00 AM - 6:00 PM"
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContactContent();
      if (data && Object.keys(data).length > 0) {
        setContent(data);
      }
    } catch (error) {
      console.error('AdminContact: Error loading contact content:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load contact content from database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await contactService.updateContactContent(content);
      toast({
        title: "Contact Page Updated",
        description: "The contact page content has been updated successfully.",
      });
    } catch (error) {
      console.error('AdminContact: Error saving contact content:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save contact content. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading contact content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-yoga-forest mb-4">Hero Section</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={content.heroTitle}
              onChange={(e) => setContent(prev => ({ ...prev, heroTitle: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Textarea
              id="heroSubtitle"
              value={content.heroSubtitle}
              onChange={(e) => setContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
      </Card>


      <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest">
        <Save size={16} className="mr-2" />
        Save Contact Page Content
      </Button>
    </div>
  );
};

export default AdminContact;
