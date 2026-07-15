import React, { useState, useEffect, useRef } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, Upload, Eye, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { galleryService } from '@/services/database';
import ImagePicker from './ImagePicker';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  date: string;
  views?: number;
  size?: string;
  dimensions?: string;
}

const AdminGallery = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    views: '0'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const data = await galleryService.getImages();
      console.log('AdminGallery: Loaded images from database:', data);
      setImages(data);
    } catch (error) {
      console.error('AdminGallery: Error loading images from database:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load images from database.",
      });
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url || !formData.title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in the required fields (URL/Image and Title).",
      });
      return;
    }

    try {
      const image = {
        title: formData.title,
        description: formData.description || '',
        url: formData.url,
        date: editingImage?.date || new Date().toISOString().split('T')[0],
        views: parseInt(formData.views) || 0
      };

      if (editingImage) {
        await galleryService.updateImage(editingImage.id, image);
        console.log('AdminGallery: Updated image:', image);
        toast({
          title: "Image Updated",
          description: "The gallery image has been updated successfully.",
        });
      } else {
        await galleryService.addImage(image);
        console.log('AdminGallery: Created new image:', image);
        toast({
          title: "Image Added",
          description: "New image has been added to the gallery successfully.",
        });
      }

      await loadImages(); // Reload images from database
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('AdminGallery: Error saving image:', error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save image. Please try again.",
      });
    }
  };

  const handleEdit = (image: GalleryImage) => {
    console.log('AdminGallery: Editing image:', image);
    setEditingImage(image);
    setFormData({
      url: image.url,
      title: image.title,
      description: image.description || '',
      views: (image.views || 0).toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('AdminGallery: Deleting image with id:', id);
      await galleryService.deleteImage(id);
      await loadImages(); // Reload images from database
      toast({
        title: "Image Deleted",
        description: "The image has been removed from the gallery.",
      });
    } catch (error) {
      console.error('AdminGallery: Error deleting image:', error);
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete image. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      views: '0'
    });
    setEditingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Gallery</h2>
        </div>
        <AdminLoadingSpinner message="Loading gallery images..." />
      </div>
    );
  }

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const paginatedImages = images.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yoga-forest">Manage Gallery</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-yoga-sage hover:bg-yoga-forest"
            >
              <Plus size={16} className="mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL Input */}
              <div>
                <Label htmlFor="url">Image URL (or select from File Manager)</Label>
                <div className="mt-1">
                  <ImagePicker
                    id="url"
                    value={formData.url}
                    onChange={(val) => setFormData({ ...formData, url: val })}
                    placeholder="Enter image URL or choose from Manager"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter image title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter image description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="views">View Count</Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                  placeholder="Enter view count"
                />
              </div>

              {formData.url && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img loading="lazy" 
                      src={formData.url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-yoga-sage hover:bg-yoga-forest"
                  disabled={isUploading}
                >
                  <Save size={16} className="mr-2" />
                  {editingImage ? 'Update' : 'Add'} Image
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {paginatedImages.map((image) => (
          <Card key={image.id} className="flex flex-row overflow-hidden items-center p-3">
            <div className="w-24 h-24 flex-shrink-0 mr-4">
              <img loading="lazy" 
                src={image.url} 
                alt={image.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-yoga-forest mb-1 truncate">{image.title}</h3>
              {image.description && (
                <p className="text-sm text-yoga-forest/70 mb-2 truncate">{image.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-yoga-sage">
                <div className="flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{image.views || 0} views</span>
                </div>
                {image.dimensions && (
                  <div className="flex items-center space-x-1">
                    <ImageIcon size={12} />
                    <span>{image.dimensions}</span>
                  </div>
                )}
                {image.size && (
                  <span>Size: {image.size}</span>
                )}
                <span>{new Date(image.date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(image)}
                className="text-yoga-forest border-yoga-sage hover:bg-yoga-sage hover:text-white"
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(image.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}

        {images.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} className="mr-2" /> Previous
            </Button>
            <span className="text-sm text-yoga-forest">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        )}

        {images.length === 0 && (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <Upload className="mx-auto mb-4 text-yoga-sage" size={48} />
              <h3 className="text-lg font-semibold text-yoga-forest mb-2">No Images Yet</h3>
              <p className="text-yoga-forest/70">Add your first image to get started.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
