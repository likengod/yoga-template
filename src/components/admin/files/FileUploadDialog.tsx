import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Save } from 'lucide-react';
import { FileItem } from '@/services/database';

interface FileUploadDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingFile: FileItem | null;
  formData: { url: string; name: string };
  setFormData: (data: { url: string; name: string }) => void;
  isUploading: boolean;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDialogClose: () => void;
}

const FileUploadDialog = ({
  isOpen,
  setIsOpen,
  editingFile,
  formData,
  setFormData,
  isUploading,
  handleFileUpload,
  handleSubmit,
  handleDialogClose
}: FileUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-yoga-sage hover:bg-yoga-forest text-white shadow-sm"
        >
          <Upload size={16} className="mr-2" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingFile ? 'Edit File Details' : 'Upload New Image'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!editingFile && (
            <div>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileUpload"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Processing...' : 'Browse Files'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, GIF</p>
              </div>
              
              <div className="flex items-center space-x-2 my-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 uppercase">Or provide URL</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="name">File Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. hero-background.jpg"
              required
              className="mt-1"
            />
          </div>

          {formData.url && (
            <div>
              <Label>Preview</Label>
              <div className="border rounded-lg p-2 bg-gray-50 mt-1 flex justify-center">
                <img loading="lazy" 
                  src={formData.url} 
                  alt="Preview" 
                  className="max-h-32 max-w-full object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-yoga-sage hover:bg-yoga-forest"
              disabled={isUploading || (!formData.url && !formData.name)}
            >
              <Save size={16} className="mr-2" />
              {editingFile ? 'Save Changes' : 'Upload File'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
