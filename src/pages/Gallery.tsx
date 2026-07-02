import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import Header from '@/components/Header';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { galleryService } from '@/services/database';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  date: string;
  views?: number;
}

const Gallery = () => {
  useScrollToTop();
  usePageMeta({
    title: 'Gallery',
    description: 'Explore our beautiful collection of yoga sessions, events, and community moments captured at SHAKTI YOGA THEME.',
  });
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const imagesPerPage = 8;

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const data = await galleryService.getAll();
      console.log('Gallery: Loaded images from database:', data);
      setImages(data);
    } catch (error) {
      console.error('Gallery: Error loading images from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = images.slice(startIndex, endIndex);

  const handleImageClick = async (image: GalleryImage) => {
    try {
      // Update view count in database
      await galleryService.update(image.id, {
        ...image,
        views: (image.views || 0) + 1
      });
      // Update local state immediately for better UX
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === image.id 
            ? { ...img, views: (img.views || 0) + 1 }
            : img
        )
      );
      // Set selected image and open dialog
      setSelectedImage({ ...image, views: (image.views || 0) + 1 });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Gallery: Error updating view count:', error);
      // Still show the image even if view count update fails
      setSelectedImage(image);
      setIsDialogOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer hover:bg-yoga-sage/10"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer hover:bg-yoga-sage/10"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show current page and surrounding pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer hover:bg-yoga-sage/10"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer hover:bg-yoga-sage/10"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yoga-cream">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6"><span className="text-yoga-terracotta">Yoga</span> Gallery</h1>
            <p className="text-lg text-yoga-forest/70 max-w-2xl mx-auto">
              Explore moments from our yoga sessions, workshops, and community gatherings.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
            <p className="text-yoga-forest">Loading gallery images...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />

      {/* Gallery Content */}
      <main className="container mx-auto px-4 py-12 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6"><span className="text-yoga-terracotta">Yoga</span> Gallery</h1>
          <p className="text-lg text-yoga-forest/70 max-w-2xl mx-auto">
            Explore moments from our yoga sessions, workshops, and community gatherings.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-yoga-forest mb-2">No Images Yet</h3>
            <p className="text-yoga-forest/70">Check back soon for new gallery images.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentImages.map((image) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img loading="lazy" 
                      src={image.url} 
                      alt={image.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-yoga-forest mb-1">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-yoga-forest/70 line-clamp-2 mb-2">{image.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-yoga-sage">
                        {new Date(image.date).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-yoga-sage">
                        <Eye size={12} />
                        <span>{image.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-yoga-sage/10'}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-yoga-sage/10'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      {/* Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <img loading="lazy" 
                src={selectedImage.url} 
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-yoga-forest/70 mb-2">{selectedImage.description}</p>
                )}
                <div className="flex items-center justify-center space-x-4 text-sm text-yoga-sage">
                  <span>{new Date(selectedImage.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{selectedImage.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
