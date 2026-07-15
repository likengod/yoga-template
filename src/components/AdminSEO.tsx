import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, FileText, Search, Image } from 'lucide-react';
import ImagePicker from './ImagePicker';
import AdminFavicon from './AdminFavicon';
import { seoSettingsService } from '@/services/database';

interface SEOData {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  author: string;
  language: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterSite: string;
  robotsTxt: string;
  favicon: string;
}

const AdminSEO = () => {
  const { toast } = useToast();
  
  const [seoData, setSeoData] = useState<SEOData>({
    siteName: 'SHAKTI YOGA THEME',
    siteDescription: 'Transform your life through authentic yoga practice with expert guidance and personalized programs.',
    siteKeywords: 'yoga, meditation, kundalini, spiritual growth, yoga teacher training, wellness, mindfulness',
    author: 'SHAKTI YOGA THEME',
    language: 'en',
    ogTitle: 'SHAKTI YOGA THEME - Transform Your Life Through Yoga',
    ogDescription: 'Discover authentic yoga practices and spiritual transformation with our expert-guided programs.',
    ogImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    twitterCard: 'summary_large_image',
    twitterSite: '@shaktiyogaraai',
    robotsTxt: `User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml`,
    favicon: '/favicon.ico'
  });

  // Load SEO data from database on mount
  useEffect(() => {
    const loadSEO = async () => {
      try {
        const settings = await seoSettingsService.getSettings();
        if (settings && settings.keywords) {
          try {
            const parsed = JSON.parse(settings.keywords);
            setSeoData({
              ...parsed,
              siteName: settings.title || parsed.siteName,
              siteDescription: settings.description || parsed.siteDescription,
              robotsTxt: settings.robotsTxt || parsed.robotsTxt
            });
          } catch (e) {
            setSeoData(prev => ({
              ...prev,
              siteName: settings.title || prev.siteName,
              siteDescription: settings.description || prev.siteDescription,
              robotsTxt: settings.robotsTxt || prev.robotsTxt,
              siteKeywords: settings.keywords || prev.siteKeywords
            }));
          }
        } else {
          // Fallback to localStorage
          const storedSEOData = localStorage.getItem('seoData');
          if (storedSEOData) {
            setSeoData(JSON.parse(storedSEOData));
          }
        }
      } catch (err) {
        console.error('Failed to load SEO settings from database:', err);
        const storedSEOData = localStorage.getItem('seoData');
        if (storedSEOData) {
          setSeoData(JSON.parse(storedSEOData));
        }
      }
    };
    
    loadSEO();
  }, []);

  return (
    <div className="space-y-6">
      {/* Favicon Management Section */}
      <AdminFavicon />

      {/* Basic SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search size={20} className="text-yoga-sage" />
            <span>Basic SEO Settings</span>
          </CardTitle>
          <CardDescription>
            Configure basic meta tags and site information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={seoData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Your site name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={seoData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Author name"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={seoData.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              placeholder="Brief description of your site (160 characters max)"
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              {seoData.siteDescription.length}/160 characters
            </p>
          </div>
          
          <div>
            <Label htmlFor="siteKeywords">Keywords</Label>
            <Input
              id="siteKeywords"
              value={seoData.siteKeywords}
              onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={seoData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              placeholder="en"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe size={20} className="text-yoga-sage" />
            <span>Social Media & Open Graph</span>
          </CardTitle>
          <CardDescription>
            Configure how your site appears when shared on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ogTitle">Open Graph Title</Label>
            <Input
              id="ogTitle"
              value={seoData.ogTitle}
              onChange={(e) => handleInputChange('ogTitle', e.target.value)}
              placeholder="Title for social media sharing"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="ogDescription">Open Graph Description</Label>
            <Textarea
              id="ogDescription"
              value={seoData.ogDescription}
              onChange={(e) => handleInputChange('ogDescription', e.target.value)}
              placeholder="Description for social media sharing"
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="ogImage">Open Graph Image URL</Label>
            <div className="mt-1">
              <ImagePicker
                id="ogImage"
                value={seoData.ogImage}
                onChange={(val) => handleInputChange('ogImage', val)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="twitterCard">Twitter Card Type</Label>
              <Input
                id="twitterCard"
                value={seoData.twitterCard}
                onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                placeholder="summary_large_image"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="twitterSite">Twitter Site Handle</Label>
              <Input
                id="twitterSite"
                value={seoData.twitterSite}
                onChange={(e) => handleInputChange('twitterSite', e.target.value)}
                placeholder="@yourhandle"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Robots.txt Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText size={20} className="text-yoga-sage" />
            <span>Robots.txt Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure how search engines crawl your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="robotsTxt">Robots.txt Content</Label>
            <Textarea
              id="robotsTxt"
              value={seoData.robotsTxt}
              onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
              placeholder="Enter robots.txt content"
              className="mt-1 font-mono"
              rows={8}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadRobotsTxt}
              className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
            >
              <FileText size={16} className="mr-2" />
              Download robots.txt
            </Button>
            
            <Button
              variant="outline"
              onClick={generateSitemap}
              className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
            >
              <Globe size={16} className="mr-2" />
              Generate Sitemap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSEO}
          className="bg-yoga-sage hover:bg-yoga-forest"
        >
          <Save size={16} className="mr-2" />
          Save SEO Settings
        </Button>
      </div>
    </div>
  );

  async function handleSaveSEO() {
    try {
      // Save to database
      const payload = {
        title: seoData.siteName,
        description: seoData.siteDescription,
        keywords: JSON.stringify(seoData),
        robotsTxt: seoData.robotsTxt,
        sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shaktiyogaraai.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/about</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/classes</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/instructors</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/store</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/contact</loc>
    <priority>0.6</priority>
  </url>
</urlset>`
      };
      
      await seoSettingsService.updateSettings(payload);
      
      // Save to localStorage as local fallback
      localStorage.setItem('seoData', JSON.stringify(seoData));
      
      // Update document meta tags immediately
      updateMetaTags();
      
      // Update robots.txt
      updateRobotsTxt();
      
      toast({
        title: "SEO Settings Saved",
        description: "All SEO settings have been updated successfully on the database."
      });
    } catch (err) {
      console.error('Failed to save SEO settings to database:', err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save SEO settings to the database. Saved locally instead."
      });
      localStorage.setItem('seoData', JSON.stringify(seoData));
    }
  }

  function updateMetaTags() {
    // Update existing meta tags or create new ones
    updateMetaTag('description', seoData.siteDescription);
    updateMetaTag('keywords', seoData.siteKeywords);
    updateMetaTag('author', seoData.author);
    updateMetaTag('og:title', seoData.ogTitle);
    updateMetaTag('og:description', seoData.ogDescription);
    updateMetaTag('og:image', seoData.ogImage);
    updateMetaTag('og:site_name', seoData.siteName);
    updateMetaTag('twitter:card', seoData.twitterCard);
    updateMetaTag('twitter:site', seoData.twitterSite);
    updateMetaTag('twitter:title', seoData.ogTitle);
    updateMetaTag('twitter:description', seoData.ogDescription);
    updateMetaTag('twitter:image', seoData.ogImage);
    
    // Update document title
    document.title = seoData.siteName;
    
    // Update language
    document.documentElement.lang = seoData.language;
  }

  function updateMetaTag(name: string, content: string) {
    let selector = '';
    let attribute = '';
    
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      selector = `meta[property="${name}"]`;
      attribute = 'property';
    } else {
      selector = `meta[name="${name}"]`;
      attribute = 'name';
    }
    
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  function updateRobotsTxt() {
    // Store robots.txt content in localStorage for reference
    localStorage.setItem('robotsTxtContent', seoData.robotsTxt);
    
    // In a real application, this would update the actual robots.txt file
    console.log('Robots.txt content updated:', seoData.robotsTxt);
  }

  function handleInputChange(field: keyof SEOData, value: string) {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function generateSitemap() {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/classes</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/instructors</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/articles</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.6</priority>
  </url>
</urlset>`;

    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Sitemap Generated",
      description: "sitemap.xml has been generated and downloaded."
    });
  }

  function downloadRobotsTxt() {
    const blob = new Blob([seoData.robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Robots.txt Downloaded",
      description: "robots.txt file has been downloaded."
    });
  }
};

export default AdminSEO;
