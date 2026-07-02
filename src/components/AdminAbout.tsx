import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Globe, FileText, Users, Image as ImageIcon } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { aboutService } from '@/services/database';

const AdminAbout = () => {
  const { toast } = useToast();
  
  const [content, setContent] = useState({
    heroTitle: "About SHAKTI YOGA THEME",
    heroSubtitle: "Transforming lives through authentic yoga practices and spiritual guidance",
    heroImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    sectionImage: "https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg",
    mission: "To provide authentic, transformative yoga experiences that nurture the mind, body, and spirit, helping individuals discover their inner strength and achieve holistic wellness.",
    vision: "To create a global community of conscious individuals who embrace yoga as a way of life, spreading peace, healing, and spiritual awakening.",
    values: [
      "Authenticity in traditional yoga practices",
      "Compassionate guidance for all levels",
      "Holistic approach to wellness",
      "Community and connection",
      "Continuous learning and growth"
    ],
    story: "SHAKTI YOGA THEME was born from a deep passion for sharing the transformative power of yoga. Founded with the vision of creating a sacred space where ancient wisdom meets modern life, we have been guiding students on their journey of self-discovery for over a decade.",
    founder: {
      name: "Sushmita Debnath",
      title: "Founder & Lead Instructor",
      bio: "With over 15 years of dedicated practice and teaching, Sushmita brings authentic yoga wisdom to modern practitioners. Her gentle yet powerful approach has transformed hundreds of lives.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await aboutService.getAboutContent();
      if (data && data.values && Array.isArray(data.values)) {
        setContent(data);
      }
    } catch (error) {
      console.error('AdminAbout: Error loading about content:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load about content from database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await aboutService.updateAboutContent(content);
      
      toast({
        title: "About Page Updated",
        description: "The about page content has been updated successfully.",
      });
    } catch (error) {
      console.error('AdminAbout: Error saving about content:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save about content. Please try again.",
      });
    }
  };

  const addValue = () => {
    setContent(prev => ({
      ...prev,
      values: [...prev.values, "New value"]
    }));
  };

  const updateValue = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === index ? value : v)
    }));
  };

  const removeValue = (index: number) => {
    setContent(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading about content...</p>
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
          
          <div>
            <Label htmlFor="heroImage">Hero Section Image URL</Label>
            <div className="mt-1">
              <ImagePicker
                id="heroImage"
                value={content.heroImage}
                onChange={(val) => handleContentChange('heroImage', val)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-yoga-forest mb-4">About Section Right Side Image</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="sectionImage">About Section Image URL</Label>
            <div className="mt-1">
              <ImagePicker
                id="sectionImage"
                value={content.sectionImage}
                onChange={(val) => handleContentChange('sectionImage', val)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img loading="lazy" 
              src={content.sectionImage} 
              alt="Section preview" 
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg';
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-yoga-forest mb-4">Mission, Vision & Values</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={content.mission}
              onChange={(e) => setContent(prev => ({ ...prev, mission: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              value={content.vision}
              onChange={(e) => setContent(prev => ({ ...prev, vision: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Values</Label>
              <Button type="button" onClick={addValue} size="sm">
                <Plus size={16} className="mr-1" />
                Add Value
              </Button>
            </div>
            <div className="space-y-2">
              {content.values.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeValue(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-yoga-forest mb-4">Story & Founder</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="story">Our Story</Label>
            <Textarea
              id="story"
              value={content.story}
              onChange={(e) => setContent(prev => ({ ...prev, story: e.target.value }))}
              rows={4}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="founderName">Founder Name</Label>
              <Input
                id="founderName"
                value={content.founder.name}
                onChange={(e) => setContent(prev => ({ 
                  ...prev, 
                  founder: { ...prev.founder, name: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="founderTitle">Founder Title</Label>
              <Input
                id="founderTitle"
                value={content.founder.title}
                onChange={(e) => setContent(prev => ({ 
                  ...prev, 
                  founder: { ...prev.founder, title: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="founderBio">Founder Bio</Label>
            <Textarea
              id="founderBio"
              value={content.founder.bio}
              onChange={(e) => setContent(prev => ({ 
                ...prev, 
                founder: { ...prev.founder, bio: e.target.value }
              }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="founderImage">Founder Image URL</Label>
            <div className="mt-1">
              <ImagePicker
                id="founderImage"
                value={content.founder.image}
                onChange={(val) => setContent(prev => ({ 
                  ...prev, 
                  founder: { ...prev.founder, image: val }
                }))}
                placeholder="https://example.com/founder.jpg"
              />
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest">
        <Save size={16} className="mr-2" />
        Save About Page Content
      </Button>
    </div>
  );
};

export default AdminAbout;
