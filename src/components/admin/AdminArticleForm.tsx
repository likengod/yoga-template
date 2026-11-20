import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Bold, Italic, Underline, Link, Image, Youtube, AlignLeft, AlignCenter, AlignRight, Upload, Sparkles, Loader2, Globe, MapPin, Bot, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Article } from '@/types/admin';

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image_url: string;
  category: string;
  views?: number;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  geo_region?: string;
  geo_placename?: string;
  geo_position?: string;
  aeo_key_takeaways?: string;
  aeo_faq_json?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface AdminArticleFormProps {
  initialData: Article | null;
  onSubmit: (data: ArticleFormData) => void;
  onCancel: () => void;
}

const AdminArticleForm: React.FC<AdminArticleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    image_url: '',
    category: 'general',
    views: 0,
    featured: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    geo_region: 'IN-UT',
    geo_placename: 'Rishikesh, Uttarakhand, India',
    geo_position: '30.0869;78.2676',
    aeo_key_takeaways: '',
    aeo_faq_json: ''
  });

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fontSize, setFontSize] = useState('medium');
  const [textAlign, setTextAlign] = useState('left');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiDialog, setShowAiDialog] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      let parsedFaqs: FaqItem[] = [];
      try {
        if (initialData.aeo_faq_json) {
          parsedFaqs = JSON.parse(initialData.aeo_faq_json);
        }
      } catch (e) {}
      setFaqs(Array.isArray(parsedFaqs) ? parsedFaqs : []);

      setFormData({
        title: initialData.title,
        content: initialData.content,
        excerpt: initialData.excerpt,
        author: initialData.author,
        image_url: initialData.image_url || '',
        category: initialData.category,
        views: initialData.views || 0,
        featured: initialData.featured || false,
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || '',
        canonical_url: initialData.canonical_url || '',
        geo_region: initialData.geo_region || 'IN-UT',
        geo_placename: initialData.geo_placename || 'Rishikesh, Uttarakhand, India',
        geo_position: initialData.geo_position || '30.0869;78.2676',
        aeo_key_takeaways: initialData.aeo_key_takeaways || '',
        aeo_faq_json: initialData.aeo_faq_json || ''
      });
    } else {
      setFaqs([]);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        image_url: '',
        category: 'general',
        views: 0,
        featured: false,
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        canonical_url: '',
        geo_region: 'IN-UT',
        geo_placename: 'Rishikesh, Uttarakhand, India',
        geo_position: '30.0869;78.2676',
        aeo_key_takeaways: '',
        aeo_faq_json: ''
      });
    }
  }, [initialData]);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a topic or prompt for AI content generation.",
      });
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `# ${aiPrompt}

## Introduction

This article explores the fascinating topic of "${aiPrompt}" and its relevance to yoga and wellness practices. Understanding this concept can greatly enhance your spiritual journey and overall well-being.

## Key Benefits

**Physical Benefits:**
- Improved flexibility and strength
- Better posture and alignment
- Enhanced circulation and energy flow

**Mental Benefits:**
- Reduced stress and anxiety
- Improved focus and concentration
- Greater emotional balance

**Spiritual Benefits:**
- Deeper connection to inner self
- Enhanced mindfulness and presence
- Spiritual growth and transformation

## Practice Guidelines

To incorporate this into your daily practice:

1. **Begin with intention** - Set a clear purpose for your practice
2. **Create sacred space** - Find a quiet, comfortable environment
3. **Focus on breath** - Use pranayama techniques to center yourself
4. **Practice mindfully** - Stay present throughout the experience
5. **End with gratitude** - Acknowledge the benefits received

## Integration with Daily Life

The principles learned through this practice can be integrated into everyday activities:

- **Morning routine** - Start your day with mindful awareness
- **Work life** - Apply breathing techniques during stressful moments
- **Relationships** - Practice compassion and understanding
- **Evening reflection** - End the day with gratitude and self-reflection

## Conclusion

By embracing the teachings related to "${aiPrompt}", we open ourselves to profound transformation and growth. Remember that consistency in practice is more important than perfection. Each step on this journey brings us closer to our authentic selves and true potential.

*Continue your exploration of this topic through regular practice, study, and connection with the yoga community. The path of yoga is one of continuous learning and discovery.*`;

      const generatedExcerpt = `Discover the transformative power of ${aiPrompt} in yoga practice. Learn how to integrate these principles into your daily life for enhanced physical, mental, and spiritual well-being.`;

      setFormData(prev => ({
        ...prev,
        title: formData.title || `The Art of ${aiPrompt} in Yoga Practice`,
        content: generatedContent,
        excerpt: generatedExcerpt,
        author: formData.author || 'SHAKTI YOGA THEME Team'
      }));

      setShowAiDialog(false);
      setAiPrompt('');
      
      toast({
        title: "AI Content Generated",
        description: "Article content has been generated successfully. You can edit it as needed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI content. Please try again.",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const insertTextAtCursor = (text: string) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.content;
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      setFormData({ ...formData, content: newContent });
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const wrapSelectedText = (before: string, after: string = '') => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = formData.content.substring(start, end);
      const wrappedText = before + selectedText + (after || before);
      
      const newContent = formData.content.substring(0, start) + wrappedText + formData.content.substring(end);
      setFormData({ ...formData, content: newContent });
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      }, 0);
    }
  };

  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleUnderline = () => wrapSelectedText('<u>', '</u>');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        insertTextAtCursor(`![Image](${result})`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = () => {
    if (imageUrl) {
      insertTextAtCursor(`![Image](${imageUrl})`);
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleLink = () => {
    if (linkText && linkUrl) {
      insertTextAtCursor(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleYoutube = () => {
    if (youtubeUrl) {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        insertTextAtCursor(`[YouTube Video](https://www.youtube.com/embed/${videoId})`);
      } else {
        insertTextAtCursor(`[YouTube Video](${youtubeUrl})`);
      }
      setYoutubeUrl('');
      setShowYoutubeDialog(false);
    }
  };

  const handleFontSize = (size: string) => {
    setFontSize(size);
    let sizeTag = '';
    switch (size) {
      case 'small': sizeTag = '<small>'; break;
      case 'large': sizeTag = '<h3>'; break;
      case 'xlarge': sizeTag = '<h2>'; break;
      case 'xxlarge': sizeTag = '<h1>'; break;
      default: return;
    }
    const closeTag = size === 'small' ? '</small>' : sizeTag.replace('<', '</');
    wrapSelectedText(sizeTag, closeTag);
  };

  const handleTextAlign = (align: string) => {
    setTextAlign(align);
    wrapSelectedText(`<div style="text-align: ${align};">`, '</div>');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.excerpt || !formData.author) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    const cleanFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
    const finalData: ArticleFormData = {
      ...formData,
      aeo_faq_json: cleanFaqs.length > 0 ? JSON.stringify(cleanFaqs) : ''
    };
    onSubmit(finalData);
  };

  return (
    <>
      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Enter author name"
              required
            />
          </div>
          <div>
            <Label htmlFor="views">Initial Views</Label>
            <Input
              id="views"
              type="number"
              min="0"
              value={formData.views}
              onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="featured" 
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
          />
          <Label htmlFor="featured" className="cursor-pointer">Mark as Featured Article</Label>
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Enter a brief excerpt"
            rows={2}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="image_url">Featured Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="philosophy">Philosophy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="content">Content * (Rich Text Editor)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAiDialog(true)}
              className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
            >
              <Sparkles size={14} className="mr-1" />
              AI Generate
            </Button>
          </div>
          
          <div className="border border-input rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-2">
            <div className="flex gap-1 border-r pr-2">
              <Button type="button" size="sm" variant="outline" onClick={handleBold} title="Bold">
                <Bold size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleItalic} title="Italic">
                <Italic size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleUnderline} title="Underline">
                <Underline size={14} />
              </Button>
            </div>

            <div className="flex gap-1 border-r pr-2">
              <Select value={fontSize} onValueChange={handleFontSize}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">XL</SelectItem>
                  <SelectItem value="xxlarge">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-1 border-r pr-2">
              <Button type="button" size="sm" variant="outline" onClick={() => handleTextAlign('left')} title="Align Left">
                <AlignLeft size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleTextAlign('center')} title="Align Center">
                <AlignCenter size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleTextAlign('right')} title="Align Right">
                <AlignRight size={14} />
              </Button>
            </div>

            <div className="flex gap-1">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowImageDialog(true)} title="Insert Image URL">
                <Image size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} title="Upload Image">
                <Upload size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowLinkDialog(true)} title="Insert Link">
                <Link size={14} />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowYoutubeDialog(true)} title="Insert YouTube Video">
                <Youtube size={14} />
              </Button>
            </div>
          </div>

          <Textarea
            ref={contentRef}
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter article content with rich formatting..."
            rows={12}
            className="rounded-t-none border-t-0"
            required
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Formatting Guide:</strong></p>
            <p>**Bold** | *Italic* | [Link Text](URL) | ![Image](URL) | Use toolbar buttons for easier formatting</p>
          </div>
        </div>

        {/* ============================================================= */}
        {/* ADVANCED SEO, GEO & AEO OPTIMIZATION PANEL                     */}
        {/* ============================================================= */}
        <div className="border border-yoga-sage/30 rounded-lg p-4 bg-white/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yoga-terracotta" size={18} />
              <h3 className="font-semibold text-yoga-forest text-sm md:text-base">Advanced Search & AI Optimization (SEO • GEO • AEO)</h3>
            </div>
            <span className="text-xs text-yoga-forest/60 bg-yoga-sage/10 px-2 py-0.5 rounded-full font-medium">Google, Maps & AI Search</span>
          </div>

          <Tabs defaultValue="seo" className="w-full">
            <TabsList className="grid grid-cols-3 mb-3 bg-yoga-cream/80">
              <TabsTrigger value="seo" className="flex items-center gap-1.5 text-xs">
                <Globe size={14} className="text-yoga-forest" />
                <span>SEO (Search)</span>
              </TabsTrigger>
              <TabsTrigger value="geo" className="flex items-center gap-1.5 text-xs">
                <MapPin size={14} className="text-yoga-forest" />
                <span>GEO (Local Maps)</span>
              </TabsTrigger>
              <TabsTrigger value="aeo" className="flex items-center gap-1.5 text-xs">
                <Bot size={14} className="text-yoga-forest" />
                <span>AEO (ChatGPT & AI)</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SEO META TAGS */}
            <TabsContent value="seo" className="space-y-3 pt-1">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="seo_title" className="text-xs font-semibold">Custom Meta Title</Label>
                    <span className={`text-[10px] ${((formData.seo_title || formData.title).length > 60) ? 'text-amber-600' : 'text-gray-400'}`}>
                      {(formData.seo_title || formData.title).length}/60 chars
                    </span>
                  </div>
                  <Input
                    id="seo_title"
                    value={formData.seo_title || ''}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder={formData.title || "Custom search engine title"}
                    className="text-xs h-9"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Leave blank to default to the article title.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="canonical_url" className="text-xs font-semibold">Canonical URL</Label>
                  </div>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url || ''}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://shaktiyogaraai.com/articles/custom-slug"
                    className="text-xs h-9"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Prevents duplicate content penalties if published elsewhere.</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="seo_description" className="text-xs font-semibold">Meta Description (Snippet)</Label>
                  <span className={`text-[10px] ${((formData.seo_description || formData.excerpt).length > 160) ? 'text-amber-600' : 'text-gray-400'}`}>
                    {(formData.seo_description || formData.excerpt).length}/160 chars
                  </span>
                </div>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description || ''}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder={formData.excerpt || "Brief summary displayed under the link in Google search results"}
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div>
                <Label htmlFor="seo_keywords" className="text-xs font-semibold mb-1 block">Focus Keywords (Comma separated)</Label>
                <Input
                  id="seo_keywords"
                  value={formData.seo_keywords || ''}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  placeholder="yoga for beginners, pranayama breathing, morning routine, rishikesh yoga"
                  className="text-xs h-9"
                />
              </div>
            </TabsContent>

            {/* TAB 2: GEO-TARGETING */}
            <TabsContent value="geo" className="space-y-3 pt-1">
              <div className="bg-amber-50/70 border border-amber-200/60 rounded p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>Geotagging helps Google Search & Maps identify your content for local queries like <em>"yoga near me"</em> or location-specific articles.</span>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="geo_placename" className="text-xs font-semibold mb-1 block">City / Placename</Label>
                  <Input
                    id="geo_placename"
                    value={formData.geo_placename || ''}
                    onChange={(e) => setFormData({ ...formData, geo_placename: e.target.value })}
                    placeholder="Rishikesh, Uttarakhand"
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="geo_region" className="text-xs font-semibold mb-1 block">Region Code (ISO 3166-2)</Label>
                  <Input
                    id="geo_region"
                    value={formData.geo_region || ''}
                    onChange={(e) => setFormData({ ...formData, geo_region: e.target.value })}
                    placeholder="IN-UT (e.g. IN-UT, US-CA)"
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="geo_position" className="text-xs font-semibold mb-1 block">Coordinates (Lat;Long)</Label>
                  <Input
                    id="geo_position"
                    value={formData.geo_position || ''}
                    onChange={(e) => setFormData({ ...formData, geo_position: e.target.value })}
                    placeholder="30.0869;78.2676"
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: AEO & AI SEARCH (Answer Engine Optimization) */}
            <TabsContent value="aeo" className="space-y-3 pt-1">
              <div className="bg-blue-50/70 border border-blue-200/60 rounded p-2 text-[11px] text-blue-800 flex items-start gap-1.5">
                <Bot size={14} className="shrink-0 mt-0.5" />
                <span><strong>AEO (Answer Engine Optimization):</strong> Formats your content for <strong>Google AI Overviews, ChatGPT Search, and Perplexity</strong> with direct bullet answers and FAQPage Schema.</span>
              </div>

              <div>
                <Label htmlFor="aeo_key_takeaways" className="text-xs font-semibold mb-1 block">Key Takeaways (Bullet Points for AI Summary)</Label>
                <Textarea
                  id="aeo_key_takeaways"
                  value={formData.aeo_key_takeaways || ''}
                  onChange={(e) => setFormData({ ...formData, aeo_key_takeaways: e.target.value })}
                  placeholder="• 15 minutes of morning yoga reduces cortisol levels by 25%&#10;• Consistent practice enhances spine flexibility and posture&#10;• Best done on an empty stomach with deep abdominal breathing"
                  rows={3}
                  className="text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">AI engines pull bullet points directly into quick-answer summary cards.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <HelpCircle size={14} className="text-yoga-sage" />
                    <Label className="text-xs font-semibold">FAQ / Q&A Schema Builder (Google "People Also Ask")</Label>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddFaq}
                    className="h-7 text-xs border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white"
                  >
                    <Plus size={12} className="mr-1" /> Add Q&A
                  </Button>
                </div>

                {faqs.length === 0 ? (
                  <div className="text-center py-3 border border-dashed rounded text-xs text-gray-400">
                    No FAQs added yet. Click "+ Add Q&A" to generate FAQPage Google Schema for this article.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-50 border rounded-md space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-yoga-forest">Question #{idx + 1}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFaq(idx)}
                            className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <Input
                          placeholder="e.g., What is the best time of day to practice Hatha yoga?"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                        <Textarea
                          placeholder="e.g., Early morning before breakfast is considered optimal for Hatha yoga practice..."
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                          rows={2}
                          className="text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-yoga-sage hover:bg-yoga-forest">
            <Save size={16} className="mr-2" />
            {initialData ? 'Update' : 'Create'} Article
          </Button>
        </div>
      </form>

      {/* AI Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles size={20} className="text-yoga-sage" />
              <span>AI Content Generator</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="aiPrompt">Article Topic or Prompt</Label>
              <Textarea
                id="aiPrompt"
                placeholder="Enter a topic or detailed prompt for the AI to write about (e.g., 'Benefits of Morning Yoga')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific about the topic you want</li>
                <li>Mention if you want focus on beginners, advanced practitioners, etc.</li>
                <li>The AI will generate yoga/wellness focused content</li>
                <li>You can edit the generated content after creation</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAiDialog(false)} disabled={isGeneratingAI}>
                Cancel
              </Button>
              <Button 
                onClick={generateAIContent}
                disabled={isGeneratingAI || !aiPrompt.trim()}
                className="bg-yoga-sage hover:bg-yoga-forest"
              >
                {isGeneratingAI ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} className="mr-2" /> Generate Content</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Dialogs */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Image URL</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Enter image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
              <Button onClick={handleImageUrl}>Insert Image</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Link text" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
            <Input placeholder="Link URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
              <Button onClick={handleLink}>Insert Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert YouTube Video</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="YouTube video URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>Cancel</Button>
              <Button onClick={handleYoutube}>Insert Video</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminArticleForm;
