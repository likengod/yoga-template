import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Article } from '@/types/admin';

interface AdminArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  selectedArticles: string[];
  onSelectArticle: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const AdminArticleList: React.FC<AdminArticleListProps> = ({ 
  articles, 
  onEdit,
  selectedArticles,
  onSelectArticle,
  onSelectAll
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (articles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold text-yoga-forest mb-2">No Articles Yet</h3>
        <p className="text-yoga-forest/70">Create your first article to get started.</p>
      </Card>
    );
  }

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const currentArticles = articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const allSelected = currentArticles.length > 0 && currentArticles.every(a => selectedArticles.includes(a.id));

  return (
    <div className="grid gap-2">
      {currentArticles.length > 0 && (
        <div className="flex items-center px-4 py-2 bg-yoga-sage/10 rounded-md border border-yoga-sage/20">
          <Checkbox 
            id="select-all" 
            checked={allSelected} 
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            className="border-yoga-forest text-yoga-forest"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-yoga-forest ml-2 cursor-pointer">
            Select All on this page
          </label>
        </div>
      )}
      {currentArticles.map((article) => (
        <Card key={article.id} className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Checkbox 
                checked={selectedArticles.includes(article.id)}
                onCheckedChange={(checked) => onSelectArticle(article.id, !!checked)}
                className="border-yoga-forest text-yoga-forest"
              />
            </div>
            <div className="flex-1 flex gap-4 ml-4">
              <div className="flex-shrink-0">
                <img loading="lazy" 
                  src={article.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"} 
                  alt={article.title}
                  className="w-16 h-12 object-cover rounded"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-yoga-forest leading-tight">{article.title}</h3>
                  {article.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      <Star size={10} className="fill-amber-500" /> PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-xs text-yoga-forest/70 mb-1 flex items-center flex-wrap gap-2">
                  <span>By {article.author}</span>
                  <span>•</span>
                  <span>{article.created_at ? new Date(article.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center"><Eye size={12} className="mr-1" /> {article.views || 0}</span>
                  <span className="text-yoga-sage border border-yoga-sage/30 px-1 rounded">Category: {article.category}</span>
                </p>
                <p className="text-xs text-yoga-forest/80 line-clamp-1">{article.excerpt}</p>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(article)}
                className="h-8 w-8 text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
              >
                <Edit size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} className="mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium text-yoga-forest">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminArticleList;
