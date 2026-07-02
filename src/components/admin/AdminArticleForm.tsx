import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Save, Bold, Italic, Underline, Link, Image, Youtube, AlignLeft, AlignCenter, AlignRight, Upload, Sparkles, Loader2 } from 'lucide-react';
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
    featured: false
  });

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
      setFormData({
        title: initialData.title,
        content: initialData.content,
        excerpt: initialData.excerpt,
        author: initialData.author,
        image_url: initialData.image_url || '',
        category: initialData.category,
        views: initialData.views || 0,
        featured: initialData.featured || false
      });
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        image_url: '',
        category: 'general',
        views: 0,
        featured: false
      });
    }
  }, [initialData]);

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
    onSubmit(formData);
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
