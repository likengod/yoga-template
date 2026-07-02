import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Check, Upload } from 'lucide-react';
import { fileService, FileItem } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export default function ImagePicker({ value, onChange, id, placeholder }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const data = await fileService.getFiles();
      setFiles(data.filter(f => f.type && f.type.startsWith('image/')));
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      img.onload = async () => {
        const dimensions = `${img.width} x ${img.height}`;
        const size = formatFileSize(file.size);
        
        const fileData = {
          name: file.name,
          url: imageUrl,
          size: size,
          type: file.type,
          dimensions: dimensions,
          uploadDate: new Date().toISOString()
        };

        const newItem = await fileService.createFile(fileData);
        toast({
          title: "File Uploaded",
          description: "Your image has been uploaded successfully.",
        });
        await loadFiles();
        handleSelect(newItem.url);
      };
      img.src = imageUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to process image.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter image URL or select from gallery"}
        className="flex-1"
      />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="flex-shrink-0">
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Image
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between mt-2">
            <DialogTitle>Select an Image from File Manager</DialogTitle>
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button 
                variant="default" 
                size="sm"
                className="bg-yoga-sage hover:bg-yoga-forest"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload New'}
              </Button>
            </div>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No images found in File Manager. Please upload some first from the File Manager tab.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 p-1">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className={`relative group cursor-pointer border rounded-md overflow-hidden aspect-square transition-all ${value === file.url ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}`}
                  onClick={() => handleSelect(file.url)}
                >
                  <img loading="lazy" src={file.url} alt={file.name} className="w-full h-full object-cover bg-muted" />
                  {value === file.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
