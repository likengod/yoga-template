
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Eye, Sparkles, HelpCircle, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareMenu from '@/components/ShareMenu';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { articlesApi } from '@/services/mysqlApi';

interface FaqItem {
  question: string;
  answer: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  created_at: string;
  image_url?: string;
  category: string;
  views?: number;
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

const ArticleDetail = () => {
  useScrollToTop();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse FAQs for AEO
  const faqs: FaqItem[] = useMemo(() => {
    if (!article?.aeo_faq_json) return [];
    try {
      const parsed = JSON.parse(article.aeo_faq_json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [article?.aeo_faq_json]);

  // Structured Data Schemas (Article + FAQPage JSON-LD)
  const schemas: object[] = useMemo(() => {
    if (!article) return [];
    const list: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.seo_title || article.title,
        "description": article.seo_description || article.excerpt,
        "image": article.image_url || undefined,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Shakti Yoga Raai"
        },
        "datePublished": article.created_at
      }
    ];

    if (faqs.length > 0) {
      list.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      });
    }

    return list;
  }, [article, faqs]);

  // Dynamically set page meta for sharing & SEO / GEO / AEO
  usePageMeta({
    title: article?.seo_title || article?.title || 'Article',
    description: article?.seo_description || article?.excerpt || article?.content?.slice(0, 160),
    image: article?.image_url,
    type: 'article',
    keywords: article?.seo_keywords,
    canonical: article?.canonical_url,
    geoRegion: article?.geo_region,
    geoPlacename: article?.geo_placename,
    geoPosition: article?.geo_position,
    schemas
  });

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    try {
      setIsLoading(true);
      const data = await articlesApi.getById(articleId);
      if (!data) {
        setArticle(null);
        return;
      }
      setArticle({
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        author: data.author,
        created_at: data.created_at || new Date().toISOString(),
        image_url: data.image_url || undefined,
        category: data.category,
        views: data.views || 0,
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
        seo_keywords: data.seo_keywords || undefined,
        canonical_url: data.canonical_url || undefined,
        geo_region: data.geo_region || undefined,
        geo_placename: data.geo_placename || undefined,
        geo_position: data.geo_position || undefined,
        aeo_key_takeaways: data.aeo_key_takeaways || undefined,
        aeo_faq_json: data.aeo_faq_json || undefined,
      });

      // Load related articles
      const allArticles = await articlesApi.getAll();
      const related = allArticles
        .filter((a: any) => a.id !== articleId && a.category === data.category)
        .slice(0, 3);
      
      // If we don't have enough in the same category, fill with others
      if (related.length < 3) {
        const others = allArticles
          .filter((a: any) => a.id !== articleId && a.category !== data.category)
          .slice(0, 3 - related.length);
        related.push(...others);
      }
      setRelatedArticles(related);

      // Increment views (non-fatal)
      articlesApi.incrementViews(articleId);
      setArticle(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
    } catch (error) {
      console.error('ArticleDetail: Failed to load:', error);
      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-yoga-cream">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-32">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
            <p className="text-yoga-forest">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-yoga-cream">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-yoga-forest mb-4">Article Not Found</h1>
            <Link to="/articles">
              <Button className="bg-yoga-sage hover:bg-yoga-forest">
                <ArrowLeft size={16} className="mr-2" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      <main className="container mx-auto px-4 py-12 pt-32">
        <div className="max-w-4xl mx-auto">
          <Link to="/articles" className="inline-flex items-center text-yoga-sage hover:text-yoga-forest mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to Articles
          </Link>
          
          <Card className="overflow-hidden">
            {article.image_url && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img loading="lazy" 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-yoga-forest mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between text-sm text-yoga-sage mb-6 pb-6 border-b border-yoga-sage/20 flex-wrap gap-2">
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  {article.geo_placename && (
                    <div className="flex items-center space-x-1 text-xs text-yoga-forest/60">
                      <MapPin size={13} className="text-yoga-terracotta" />
                      <span>{article.geo_placename}</span>
                    </div>
                  )}
                </div>
                {article.views !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{article.views} views</span>
                  </div>
                )}
              </div>

              {/* AEO Key Takeaways Summary Card */}
              {article.aeo_key_takeaways && (
                <div className="mb-8 p-5 bg-gradient-to-r from-yoga-cream via-amber-50/50 to-yoga-cream border-l-4 border-yoga-terracotta rounded-r-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2 font-bold text-yoga-forest text-xs uppercase tracking-wider">
                    <Sparkles size={15} className="text-yoga-terracotta" />
                    <span>Key Takeaways (Quick Summary)</span>
                  </div>
                  <div className="text-sm text-yoga-forest/90 whitespace-pre-line leading-relaxed">
                    {article.aeo_key_takeaways}
                  </div>
                </div>
              )}
              
              <div className="prose prose-lg max-w-none text-yoga-forest">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* AEO Frequently Asked Questions Section */}
              {faqs.length > 0 && (
                <div className="mt-10 pt-6 border-t border-yoga-sage/20">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle size={18} className="text-yoga-sage" />
                    <h3 className="text-xl font-bold text-yoga-forest">Frequently Asked Questions</h3>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left font-semibold text-yoga-forest hover:text-yoga-sage">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-yoga-forest/80 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 pt-6 border-t border-yoga-sage/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-yoga-forest">Share this article</h3>
                  <ShareMenu
                    title={article.title}
                    description={article.excerpt}
                    url={window.location.href}
                    iconOnly
                    className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-8 w-8 rounded-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-yoga-forest mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                  <Link key={related.id} to={`/articles/${related.id}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="h-40 overflow-hidden">
                        <img loading="lazy" 
                          src={related.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"} 
                          alt={related.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-yoga-sage mb-2 font-medium uppercase tracking-wider">
                          {related.category}
                        </p>
                        <h3 className="font-semibold text-yoga-forest line-clamp-2 hover:text-yoga-sage transition-colors">
                          {related.title}
                        </h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
