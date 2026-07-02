
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareMenu from '@/components/ShareMenu';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { articlesApi } from '@/services/mysqlApi';

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
}

const ArticleDetail = () => {
  useScrollToTop();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically set page meta for sharing
  usePageMeta({
    title: article?.title || 'Article',
    description: article?.excerpt || article?.content?.slice(0, 160),
    image: article?.image_url,
    type: 'article',
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
              
              <div className="flex items-center justify-between text-sm text-yoga-sage mb-6 pb-6 border-b border-yoga-sage/20">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {article.views !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{article.views} views</span>
                  </div>
                )}
              </div>
              
              <div className="prose prose-lg max-w-none text-yoga-forest">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-6 border-t border-yoga-sage/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-yoga-forest">Share this article</h3>
                  <ShareMenu
                    title={article.title}
                    description={article.excerpt}
                    url={window.location.href}
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
