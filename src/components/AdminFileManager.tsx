import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Trash2, FolderOpen, ChevronLeft, ChevronRight, LayoutGrid, List, Grid2X2, CheckSquare, FileImage } from 'lucide-react';
import { fileService, FileItem } from '@/services/database';
import FileUploadDialog from './admin/files/FileUploadDialog';
import FileGrid from './admin/files/FileGrid';

const ITEMS_PER_PAGE = 15;

const AdminFileManager = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'small-grid' | 'list'>('list');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    url: '',
    name: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const data = await fileService.getFiles();
      setFiles(data);
    } catch (error) {
      console.error('AdminFileManager: Error loading files:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load files.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image file.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadRes = await fileService.uploadFile(file);
      const imageUrl = uploadRes.url;
      
      const img = new Image();
      img.onload = () => {
        const dimensions = `${img.width} x ${img.height}`;
        const size = formatFileSize(file.size);
        
        setFormData({
          url: imageUrl,
          name: file.name
        });

        // We can temporarily attach this data directly to the dialog state
        (window as any)._tempUploadData = { dimensions, size, type: file.type };
      };
      img.src = imageUrl;

      toast({
        title: "File Uploaded",
        description: "File ready to be saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to process image.",
      });
    } finally {
      setIsUploading(false);
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
    
    if (!formData.url || !formData.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a file URL and name.",
      });
      return;
    }

    try {
      const tempUploadData = (window as any)._tempUploadData || {};
      
      const fileData = {
        name: formData.name,
        url: formData.url,
        size: editingFile?.size || tempUploadData.size || 'Unknown size',
        type: editingFile?.type || tempUploadData.type || 'image/jpeg',
        dimensions: editingFile?.dimensions || tempUploadData.dimensions || 'Unknown dimensions',
        uploadDate: editingFile?.uploadDate || new Date().toISOString()
      };

      if (editingFile) {
        await fileService.updateFile(editingFile.id, fileData);
        toast({
          title: "File Updated",
          description: "File details have been updated.",
        });
      } else {
        await fileService.createFile(fileData);
        toast({
          title: "File Added",
          description: "New file has been uploaded successfully.",
        });
        setCurrentPage(1); // Go to first page to see the newly added file
      }

      await loadFiles();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Failed to save file. Please try again.",
      });
    }
  };

  const handleEdit = (file: FileItem) => {
    setEditingFile(file);
    setFormData({
      url: file.url,
      name: file.name
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      await loadFiles();
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast({
        title: "File Deleted",
        description: "The file has been permanently deleted.",
      });
      
      // Adjust page if we deleted the last item on the current page
      const newTotalPages = Math.ceil((files.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete file. Please try again.",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedFiles).map(id => fileService.deleteFile(id));
      await Promise.all(deletePromises);
      await loadFiles();
      setSelectedFiles(new Set());
      toast({
        title: "Files Deleted",
        description: `${selectedFiles.size} files have been permanently deleted.`,
      });
      
      // Reset to page 1 to be safe after bulk delete
      setCurrentPage(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete some files. Please try again.",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === currentFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(currentFiles.map(f => f.id)));
    }
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setFormData({ url: '', name: '' });
    setEditingFile(null);
    (window as any)._tempUploadData = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "File URL has been copied to clipboard.",
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const currentFiles = files.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yoga-forest">File Manager</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest flex items-center gap-2">
            <FolderOpen className="text-yoga-sage" /> File Manager
          </h2>
          <p className="text-yoga-forest/70 text-sm mt-1">Manage and upload your images for use across the site.</p>
        </div>
        <FileUploadDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingFile={editingFile}
          formData={formData}
          setFormData={setFormData}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
          handleSubmit={handleSubmit}
          handleDialogClose={handleDialogClose}
        />
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {files.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <FileImage className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-yoga-forest">No files found</h3>
            <p className="text-sm text-yoga-forest/70 mt-1">Upload your first image to see it here.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleSelectAll}
                  className="text-xs flex gap-2 items-center"
                >
                  <CheckSquare size={14} />
                  {selectedFiles.size === currentFiles.length && currentFiles.length > 0 ? "Deselect All" : "Select All"}
                </Button>
                {selectedFiles.size > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                    className="text-xs"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete ({selectedFiles.size})
                  </Button>
                )}
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1 shrink-0 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 h-8 ${viewMode === 'grid' ? 'bg-yoga-sage text-white' : ''}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'small-grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('small-grid')}
                  className={`px-3 py-1 h-8 ${viewMode === 'small-grid' ? 'bg-yoga-sage text-white' : ''}`}
                  title="Small Grid View"
                >
                  <Grid2X2 size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 h-8 ${viewMode === 'list' ? 'bg-yoga-sage text-white' : ''}`}
                  title="List View"
                >
                  <List size={16} />
                </Button>
              </div>
            </div>

            <FileGrid
              files={currentFiles}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              toggleSelectFile={toggleSelectFile}
              copyToClipboard={copyToClipboard}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-6 mt-6">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, files.length)}</span> of <span className="font-medium">{files.length}</span> results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Prev
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${currentPage === i + 1 ? 'bg-yoga-sage hover:bg-yoga-forest text-white' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFileManager;
