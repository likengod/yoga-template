import React, { useState, useEffect } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { aboutService } from '@/services/database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const defaultContent = {
  heroTitle: "About SHAKTI YOGA THEME",
  heroSubtitle: "Transforming lives through authentic yoga practices for over 15 years",
  storyTitle: "Our Story",
  storyText: "Founded with a vision to bring authentic yoga practices to modern practitioners, SHAKTI YOGA THEME has been a beacon of transformation for over 15 years. Our journey began with a simple belief: yoga is not just a practice—it's a way of life.\n\nWe combine traditional Hatha, Vinyasa, and Ashtanga yoga with modern wellness techniques to create a holistic experience that transforms lives. Every class is designed to honor the sacred tradition of yoga while making it accessible to practitioners of all levels.",
  storyImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  philosophyTitle: "Our Philosophy",
  philosophySubtitle: "We believe in creating a safe, nurturing environment where you can explore your potential and discover your inner strength.",
  philosophyCards: [
    { title: 'Authenticity', description: 'We honor traditional yoga practices while making them accessible to modern practitioners.' },
    { title: 'Transformation', description: 'Every practice is designed to create positive change in mind, body, and spirit.' },
    { title: 'Community', description: 'We foster a supportive environment where everyone feels welcome and valued.' },
    { title: 'Excellence', description: 'We maintain the highest standards in teaching, safety, and student care.' }
  ],
  featuresTitle: "What Makes Us Special",
  featuresCards: [
    { icon: 'Heart', title: 'Mindful Practice', description: 'Connect with your inner self through mindful yoga practices rooted in ancient traditions.' },
    { icon: 'Leaf', title: 'Natural Healing', description: 'Experience holistic healing that nurtures your body and mind naturally.' },
    { icon: 'Sun', title: 'Energy Balance', description: 'Restore your energy flow and find perfect balance in all aspects of life.' },
    { icon: 'Users', title: 'Community', description: 'Join a supportive community of like-minded individuals on their wellness journey.' }
  ],
  impactTitle: "Our Impact",
  impactSubtitle: "Numbers that reflect our commitment to transforming lives through yoga",
  impactCards: [
    { icon: 'Award', number: '15+', label: 'Years of Experience' },
    { icon: 'Users', number: '1000+', label: 'Students Transformed' },
    { icon: 'Clock', number: '5000+', label: 'Classes Conducted' },
    { icon: 'Heart', number: '98%', label: 'Student Satisfaction' }
  ],
  studioTitle: "Visit Our Studio",
  studioSubtitle: "Join us at our peaceful studio space designed for transformation",
  studioCards: [
    { icon: 'MapPin', title: 'Location', line1: '123 Wellness Street', line2: 'Mumbai 400001' },
    { icon: 'Clock', title: 'Hours', line1: 'Monday - Sunday', line2: '6:00 AM - 9:00 PM' },
    { icon: 'Users', title: 'Classes', line1: 'All Levels Welcome', line2: 'Small Group Sessions' }
  ]
};

const AdminAbout = () => {
  const { toast } = useToast();
  const [content, setContent] = useState(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [legacyFounder, setLegacyFounder] = useState<any>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await aboutService.getAboutContent();
      if (data && data.heroTitle) {
        let customContent = {};
        if (data.vision) {
          try {
            const parsed = JSON.parse(data.vision);
            if (parsed && typeof parsed === 'object' && parsed.philosophyCards) {
              customContent = parsed;
            }
          } catch (e) {
            // Ignore legacy non-JSON vision statement data
          }
        }

        // Store legacy founder object to preserve it during save
        if (data.founder) {
          setLegacyFounder(data.founder);
        }

        setContent({
          heroTitle: data.heroTitle || defaultContent.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultContent.heroSubtitle,
          storyTitle: (customContent as any).storyTitle || data.founder?.name || defaultContent.storyTitle,
          storyText: data.story || defaultContent.storyText,
          storyImage: data.sectionImage || defaultContent.storyImage,
          
          philosophyTitle: (customContent as any).philosophyTitle || defaultContent.philosophyTitle,
          philosophySubtitle: (customContent as any).philosophySubtitle || defaultContent.philosophySubtitle,
          featuresTitle: (customContent as any).featuresTitle || data.heroImage || defaultContent.featuresTitle,
          impactTitle: (customContent as any).impactTitle || defaultContent.impactTitle,
          impactSubtitle: (customContent as any).impactSubtitle || defaultContent.impactSubtitle,
          studioTitle: (customContent as any).studioTitle || defaultContent.studioTitle,
          studioSubtitle: (customContent as any).studioSubtitle || defaultContent.studioSubtitle,
          
          philosophyCards: (customContent as any).philosophyCards || defaultContent.philosophyCards,
          featuresCards: (customContent as any).featuresCards || defaultContent.featuresCards,
          impactCards: (customContent as any).impactCards || defaultContent.impactCards,
          studioCards: (customContent as any).studioCards || defaultContent.studioCards
        });
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

  const handleSave = async () => {
    try {
      const customJSON = {
        storyTitle: content.storyTitle,
        philosophyTitle: content.philosophyTitle,
        philosophySubtitle: content.philosophySubtitle,
        philosophyCards: content.philosophyCards,
        featuresTitle: content.featuresTitle,
        featuresCards: content.featuresCards,
        impactTitle: content.impactTitle,
        impactSubtitle: content.impactSubtitle,
        impactCards: content.impactCards,
        studioTitle: content.studioTitle,
        studioSubtitle: content.studioSubtitle,
        studioCards: content.studioCards
      };

      const payload = {
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        sectionImage: content.storyImage,
        story: content.storyText,
        heroImage: content.featuresTitle,
        vision: JSON.stringify(customJSON),
        // Preserve legacy founder values untouched to avoid printing image path as a subtitle
        founder: legacyFounder ? {
          name: legacyFounder.name || "",
          title: legacyFounder.title || "",
          image: legacyFounder.image || "",
          bio: legacyFounder.bio || ""
        } : undefined
      };

      await aboutService.updateAboutContent(payload);
      
      toast({
        title: "About Page Updated",
        description: "All About page sections have been updated successfully.",
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

  const updateCardField = (arrayKey: 'philosophyCards' | 'featuresCards' | 'impactCards' | 'studioCards', index: number, field: string, value: string) => {
    setContent(prev => {
      const newArray = [...prev[arrayKey]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayKey]: newArray };
    });
  };

  if (isLoading) {
    return <AdminLoadingSpinner message="Loading about content..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yoga-forest">Manage About Page</h2>
        <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest">
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['hero', 'story']} className="w-full space-y-4">
        
        {/* 1. Hero Headers */}
        <AccordionItem value="hero" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Hero Header</span>
              <span className="text-sm text-gray-500 font-normal">Page Title and Subtitle</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">About Page Title</Label>
                <Input
                  id="heroTitle"
                  value={content.heroTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="heroSubtitle">About Page Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={content.heroSubtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Story Section */}
        <AccordionItem value="story" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Story Section</span>
              <span className="text-sm text-gray-500 font-normal">Main Story Title, Image and text description</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div>
                <Label htmlFor="storyTitle">Story Section Title</Label>
                <Input
                  id="storyTitle"
                  value={content.storyTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, storyTitle: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="storyImage">Story Side Image URL</Label>
                <div className="mt-1 flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <ImagePicker
                      id="storyImage"
                      value={content.storyImage}
                      onChange={(val) => setContent(prev => ({ ...prev, storyImage: val }))}
                    />
                  </div>
                  <div className="w-full md:w-1/3 border rounded-md overflow-hidden bg-gray-50 h-24">
                    <img loading="lazy" 
                      src={content.storyImage} 
                      alt="Story preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="storyText">Story Text (press enter twice for new paragraphs)</Label>
                <Textarea
                  id="storyText"
                  value={content.storyText}
                  onChange={(e) => setContent(prev => ({ ...prev, storyText: e.target.value }))}
                  rows={8}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Philosophy Section */}
        <AccordionItem value="philosophy" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Philosophy Section</span>
              <span className="text-sm text-gray-500 font-normal">Section Title, Subtitle, and 4 Values Cards</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={content.philosophyTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, philosophyTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Input
                    value={content.philosophySubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, philosophySubtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {content.philosophyCards.map((card, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <h4 className="font-semibold text-yoga-forest text-sm">Value Card {index + 1}</h4>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={card.title}
                        onChange={(e) => updateCardField('philosophyCards', index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => updateCardField('philosophyCards', index, 'description', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Special Features */}
        <AccordionItem value="features" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">What Makes Us Special</span>
              <span className="text-sm text-gray-500 font-normal">Section Title and 4 Feature Cards (with icons)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={content.featuresTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, featuresTitle: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {content.featuresCards.map((card, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <h4 className="font-semibold text-yoga-forest text-sm">Feature Card {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={card.title}
                          onChange={(e) => updateCardField('featuresCards', index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select
                          value={card.icon}
                          onValueChange={(val) => updateCardField('featuresCards', index, 'icon', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Heart">Heart</SelectItem>
                            <SelectItem value="Leaf">Leaf</SelectItem>
                            <SelectItem value="Sun">Sun</SelectItem>
                            <SelectItem value="Users">Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => updateCardField('featuresCards', index, 'description', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Impact */}
        <AccordionItem value="impact" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Impact Numbers</span>
              <span className="text-sm text-gray-500 font-normal">Section Title, Subtitle, and 4 Impact Stats</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={content.impactTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, impactTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Input
                    value={content.impactSubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, impactSubtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {content.impactCards.map((card, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <h4 className="font-semibold text-yoga-forest text-sm">Stat Card {index + 1}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label>Stat Number (e.g. 15+)</Label>
                        <Input
                          value={card.number}
                          onChange={(e) => updateCardField('impactCards', index, 'number', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select
                          value={card.icon}
                          onValueChange={(val) => updateCardField('impactCards', index, 'icon', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Award">Award</SelectItem>
                            <SelectItem value="Users">Users</SelectItem>
                            <SelectItem value="Clock">Clock</SelectItem>
                            <SelectItem value="Heart">Heart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Label Description (e.g. Years of Experience)</Label>
                      <Input
                        value={card.label}
                        onChange={(e) => updateCardField('impactCards', index, 'label', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Studio Details */}
        <AccordionItem value="studio" className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-yoga-forest">Studio Cards</span>
              <span className="text-sm text-gray-500 font-normal">Section Title, Subtitle, and 3 Info Cards</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={content.studioTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, studioTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Input
                    value={content.studioSubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, studioSubtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {content.studioCards.map((card, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <h4 className="font-semibold text-yoga-forest text-sm">Info Card {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={card.title}
                          onChange={(e) => updateCardField('studioCards', index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select
                          value={card.icon}
                          onValueChange={(val) => updateCardField('studioCards', index, 'icon', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MapPin">MapPin</SelectItem>
                            <SelectItem value="Clock">Clock</SelectItem>
                            <SelectItem value="Users">Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Line 1</Label>
                      <Input
                        value={card.line1}
                        onChange={(e) => updateCardField('studioCards', index, 'line1', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Line 2</Label>
                      <Input
                        value={card.line2}
                        onChange={(e) => updateCardField('studioCards', index, 'line2', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest w-full py-6 text-base font-semibold">
        <Save size={18} className="mr-2" />
        Save All About Page Content
      </Button>
    </div>
  );
};

export default AdminAbout;
