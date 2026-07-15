
import React, { useState, useEffect } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Article } from '@/types/admin';
import AdminArticleForm, { ArticleFormData } from './admin/AdminArticleForm';
import AdminArticleList from './admin/AdminArticleList';
import { SEED_ARTICLES } from '@/utils/seedData';
import { articlesApi } from '@/services/mysqlApi';

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
      
      // Auto-seed if database is empty
      if (Array.isArray(data) && data.length === 0) {
        console.log('AdminArticles: Database is empty, seeding default articles...');
        await articlesApi.seed(SEED_ARTICLES);
        data = await articlesApi.getAll();
      }
      
      console.log('AdminArticles: Loaded from database:', data);
      setArticles(data || []);
    } catch (error) {
      console.error('AdminArticles: Error loading articles:', error);
      toast({
        title: "Database Disconnected",
        description: "Showing fallback articles because MySQL requires a password.",
        variant: "default",
      });
      setArticles(SEED_ARTICLES as Article[]);
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
          published: true
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
    
    try {
      await Promise.all(selectedArticles.map(id => articlesApi.remove(id)));

      await loadArticles();
      setSelectedArticles([]);
      toast({
        title: "Articles Deleted",
        description: `Successfully deleted ${selectedArticles.length} articles.`,
      });
    } catch (error) {
      console.error('AdminArticles: Error deleting articles:', error);
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete articles. They might be fallback articles.",
      });
    }
  };

  const handleSeed = async () => {
    try {
      setIsLoading(true);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yoga-forest flex items-center gap-2">
          <span>Manage Articles</span>
          <span className="text-sm font-normal text-yoga-forest/60 bg-yoga-sage/10 px-2 py-0.5 rounded-full border border-yoga-sage/20">
            {articles.length} total
          </span>
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingArticle(null);
                setIsDialogOpen(true);
              }}
              className="bg-yoga-sage hover:bg-yoga-forest"
            >
              <Plus size={16} className="mr-2" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </DialogTitle>
            </DialogHeader>
            <AdminArticleForm 
              initialData={editingArticle}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
