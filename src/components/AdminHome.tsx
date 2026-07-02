import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { homeContentService, HomeContentData } from '@/services/database';
import ImagePicker from './ImagePicker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AdminHome = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<HomeContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await homeContentService.getHomeContent();
      
      const defaultContent = {
        hero: {
          titleTop: "DISCOVER YOUR",
          titleBottom: "INNER PEACE",
          subtitle: "Join our vibrant yoga community to transform your mind, body, and spirit. Expert instruction for all levels.",
          buttonPrimary: "Start Your Journey",
          buttonSecondary: "View Classes",
          stats: { years: "15+", students: "20k+", classes: "50+" },
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        about: {
          title: "Our Philosophy",
          description: "We believe yoga is for everyone. Our approach combines ancient wisdom with modern understanding.",
          philosophyTitle: "Mind-Body Harmony",
          philosophyP1: "Through conscious breath and mindful movement, we create space for profound transformation.",
          philosophyP2: "Our inclusive environment supports each student's unique journey toward wellness.",
          button: "Learn More",
          image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          features: [
            { title: "Expert Teachers", description: "Certified instructors with years of experience." },
            { title: "Flexible Schedule", description: "Classes from early morning to late evening." }
          ]
        }
      };

      if (!data || Object.keys(data).length === 0 || !data.hero || !data.about || !data.about.features || !Array.isArray(data.about.features)) {
        setContent(defaultContent as any);
      } else {
        setContent(data);
      }
    } catch (error) {
      console.error('AdminHome: Error loading home content:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load home page content.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    try {
      await homeContentService.updateHomeContent(content);
      toast({
        title: "Home Page Updated",
        description: "The home page content has been updated successfully.",
      });
    } catch (error) {
      console.error('AdminHome: Error saving home content:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save home page content. Please try again.",
      });
    }
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    if (!content) return;
    const newFeatures = [...content.about.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setContent({
      ...content,
      about: { ...content.about, features: newFeatures }
    });
  };

  if (isLoading || !content) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading home page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yoga-forest">Home Page Content</h2>
        <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest">
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['hero', 'about']} className="w-full space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Hero Section</span>
              <span className="text-sm text-gray-500 font-normal">Main banner, titles, stats, and buttons</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="titleTop">Title Top Line</Label>
                  <Input
                    id="titleTop"
                    value={content.hero.titleTop}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleTop: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="titleBottom">Title Bottom Line</Label>
                  <Input
                    id="titleBottom"
                    value={content.hero.titleBottom}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleBottom: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  rows={3}
                  value={content.hero.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buttonPrimary">Primary Button Text</Label>
                  <Input
                    id="buttonPrimary"
                    value={content.hero.buttonPrimary}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, buttonPrimary: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="buttonSecondary">Secondary Button Text</Label>
                  <Input
                    id="buttonSecondary"
                    value={content.hero.buttonSecondary}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, buttonSecondary: e.target.value } })}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <h4 className="font-semibold text-yoga-forest">Hero Stats</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Years Experience</Label>
                    <Input
                      value={content.hero.stats.years}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, stats: { ...content.hero.stats, years: e.target.value } } })}
                    />
                  </div>
                  <div>
                    <Label>Happy Students</Label>
                    <Input
                      value={content.hero.stats.students}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, stats: { ...content.hero.stats, students: e.target.value } } })}
                    />
                  </div>
                  <div>
                    <Label>Class Types</Label>
                    <Input
                      value={content.hero.stats.classes}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, stats: { ...content.hero.stats, classes: e.target.value } } })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="heroImage">Hero Background Image URL</Label>
                <div className="mt-1">
                  <ImagePicker
                    id="heroImage"
                    value={content.hero.image}
                    onChange={(val) => setContent({ ...content, hero: { ...content.hero, image: val } })}
                  />
                </div>
                <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                  <img loading="lazy" 
                    src={content.hero.image} 
                    alt="Hero preview" 
                    className="w-full h-40 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg';
                    }}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* About Section */}
        <AccordionItem value="about" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">About Section</span>
              <span className="text-sm text-gray-500 font-normal">Introductory about text, philosophy, and features</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div>
                <Label htmlFor="aboutTitle">Section Title</Label>
                <Input
                  id="aboutTitle"
                  value={content.about.title}
                  onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                />
              </div>

              <div>
                <Label htmlFor="aboutDescription">Section Description</Label>
                <Textarea
                  id="aboutDescription"
                  rows={2}
                  value={content.about.description}
                  onChange={(e) => setContent({ ...content, about: { ...content.about, description: e.target.value } })}
                />
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <h4 className="font-semibold text-yoga-forest">Our Philosophy</h4>
                <div>
                  <Label>Philosophy Title</Label>
                  <Input
                    value={content.about.philosophyTitle}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, philosophyTitle: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    rows={3}
                    value={content.about.philosophyP1}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, philosophyP1: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    rows={3}
                    value={content.about.philosophyP2}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, philosophyP2: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Read More Button Text</Label>
                  <Input
                    value={content.about.button}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, button: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aboutImage">About Section Image URL</Label>
                <div className="mt-1">
                  <ImagePicker
                    id="aboutImage"
                    value={content.about.image}
                    onChange={(val) => setContent({ ...content, about: { ...content.about, image: val } })}
                  />
                </div>
                <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                  <img loading="lazy" 
                    src={content.about.image} 
                    alt="About preview" 
                    className="w-full h-40 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg';
                    }}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <h4 className="font-semibold text-yoga-forest">Features</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {content.about.features.map((feature, index) => (
                    <Card key={index} className="p-4 space-y-3">
                      <div>
                        <Label>Feature {index + 1} Title</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Feature {index + 1} Description</Label>
                        <Textarea
                          rows={2}
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AdminHome;
