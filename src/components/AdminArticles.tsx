
import React, { useState, useEffect, Suspense, lazy } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Article } from '@/types/admin';
import type { ArticleFormData } from './admin/AdminArticleForm';
import AdminArticleList from './admin/AdminArticleList';
import AdminHeader from './admin/AdminHeader';
import { Badge } from '@/components/ui/badge';
import { articlesApi } from '@/services/mysqlApi';

const AdminArticleForm = lazy(() => import('./admin/AdminArticleForm'));

const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      let data = await articlesApi.getAll();
      
      // Auto-seed ONLY if database is empty on first-ever launch and user has NOT cleared articles
      const hasCleared = localStorage.getItem('articles_cleared') === 'true';
      const hasSeeded = localStorage.getItem('articles_seeded') === 'true';

      if (Array.isArray(data) && data.length === 0 && !hasCleared && !hasSeeded) {
        console.log('AdminArticles: Database is empty on initial setup, seeding default articles...');
        localStorage.setItem('articles_seeded', 'true');
        const { SEED_ARTICLES } = await import('@/utils/seedData');
        await articlesApi.seed(SEED_ARTICLES);
        data = await articlesApi.getAll();
      }
      
      setArticles(data || []);
    } catch (error) {
      console.error('AdminArticles: Error loading articles:', error);
      if (localStorage.getItem('articles_cleared') !== 'true') {
        const { SEED_ARTICLES } = await import('@/utils/seedData');
        setArticles(SEED_ARTICLES as Article[]);
      } else {
        setArticles([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: ArticleFormData) => {
    try {
      if (editingArticle) {
        // Update existing article
        await articlesApi.update(editingArticle.id, {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          image_url: formData.image_url || null,
          category: formData.category,
          views: formData.views || 0,
          featured: formData.featured || false,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: formData.seo_keywords || null,
          canonical_url: formData.canonical_url || null,
          geo_region: formData.geo_region || null,
          geo_placename: formData.geo_placename || null,
          geo_position: formData.geo_position || null,
          aeo_key_takeaways: formData.aeo_key_takeaways || null,
          aeo_faq_json: formData.aeo_faq_json || null,
          updated_at: new Date().toISOString()
        });

        toast({
          title: "Article Updated",
          description: "The article has been updated successfully.",
        });
      } else {
        // Create new article
        await articlesApi.create({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          image_url: formData.image_url || null,
          category: formData.category,
          views: formData.views || 0,
          featured: formData.featured || false,
          published: true,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          seo_keywords: formData.seo_keywords || null,
          canonical_url: formData.canonical_url || null,
          geo_region: formData.geo_region || null,
          geo_placename: formData.geo_placename || null,
          geo_position: formData.geo_position || null,
          aeo_key_takeaways: formData.aeo_key_takeaways || null,
          aeo_faq_json: formData.aeo_faq_json || null,
        });

        toast({
          title: "Article Created",
          description: "New article has been created successfully.",
        });
      }

      await loadArticles();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('AdminArticles: Error saving article:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save article. Please try again.",
      });
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedArticles.length} selected articles?`)) return;
    
    const countToDelete = selectedArticles.length;
    const idsToDelete = [...selectedArticles];

    try {
      await Promise.all(idsToDelete.map(id => articlesApi.remove(id).catch(() => {})));

      setArticles(prev => {
        const remaining = prev.filter(a => !idsToDelete.includes(a.id));
        if (remaining.length === 0) {
          localStorage.setItem('articles_cleared', 'true');
        }
        return remaining;
      });
      setSelectedArticles([]);

      toast({
        title: "Articles Deleted",
        description: `Successfully deleted ${countToDelete} articles.`,
      });
    } catch (error) {
      console.error('AdminArticles: Error deleting articles:', error);
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete articles. Please try again.",
      });
    }
  };

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      const { SEED_ARTICLES } = await import('@/utils/seedData');
      await articlesApi.seed(SEED_ARTICLES);
      await loadArticles();
      toast({
        title: "Articles Seeded",
        description: "15 Indian Yoga articles have been added.",
      });
    } catch (error) {
      console.error('Error seeding articles:', error);
      toast({
        variant: "destructive",
        title: "Seed Error",
        description: "Failed to seed articles.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Articles</h2>
        </div>
        <AdminLoadingSpinner message="Loading articles..." />
      </div>
    );
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Manage Articles"
        description="Publish, edit, and organize yoga wellness articles and blog posts"
        icon={FileText}
        badge={
          <Badge variant="outline" className="text-yoga-forest border-yoga-sage/30 bg-yoga-sage/10 font-medium">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </Badge>
        }
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingArticle(null);
                  setIsDialogOpen(true);
                }}
                className="bg-yoga-sage hover:bg-yoga-forest text-white h-9 text-sm font-medium shadow-sm"
              >
                <Plus size={16} className="mr-1.5" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </DialogTitle>
              </DialogHeader>
              <Suspense fallback={<AdminLoadingSpinner />}>
                <AdminArticleForm 
                  initialData={editingArticle}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </Suspense>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search articles by title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedArticles.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedArticles.length})
          </Button>
        )}
      </div>

      <AdminArticleList 
        articles={filteredArticles}
        onEdit={handleEdit}
        selectedArticles={selectedArticles}
        onSelectArticle={(id, checked) => {
          setSelectedArticles(prev => checked ? [...prev, id] : prev.filter(aId => aId !== id));
        }}
        onSelectAll={(checked) => {
          setSelectedArticles(checked ? filteredArticles.map(a => a.id) : []);
        }}
      />
    </div>
  );
};

export default AdminArticles;
