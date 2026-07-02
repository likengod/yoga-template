import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import { FileItem } from '@/services/database';

interface FileGridProps {
  files: FileItem[];
  viewMode: 'grid' | 'small-grid' | 'list';
  selectedFiles: Set<string>;
  toggleSelectFile: (id: string) => void;
  copyToClipboard: (url: string) => void;
  handleEdit: (file: FileItem) => void;
  handleDelete: (id: string) => void;
}

const FileGrid = ({
  files,
  viewMode,
  selectedFiles,
  toggleSelectFile,
  copyToClipboard,
  handleEdit,
  handleDelete
}: FileGridProps) => {

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.id} className={`flex items-center gap-4 p-3 hover:shadow-md transition-shadow ${selectedFiles.has(file.id) ? 'ring-2 ring-yoga-sage/50 bg-yoga-sage/5' : ''}`}>
            <div className="flex items-center justify-center pl-2">
              <Checkbox 
                checked={selectedFiles.has(file.id)} 
                onCheckedChange={() => toggleSelectFile(file.id)}
              />
            </div>
            <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center shrink-0 border">
              <img 
                src={file.url} 
                alt={file.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">{file.dimensions} • {file.size}</p>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(file.url)} className="text-xs h-8">
                Copy URL
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(file)} className="h-8 w-8 text-yoga-forest">
                <Edit size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${viewMode === 'small-grid' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
      {files.map((file) => (
        <Card key={file.id} className={`overflow-hidden group flex flex-col hover:shadow-md transition-shadow relative ${selectedFiles.has(file.id) ? 'ring-2 ring-yoga-sage border-yoga-sage' : ''}`}>
          <div className="absolute top-2 left-2 z-10">
            <Checkbox 
              checked={selectedFiles.has(file.id)} 
              onCheckedChange={() => toggleSelectFile(file.id)}
              className={`bg-white/80 backdrop-blur-sm ${selectedFiles.has(file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
            />
          </div>
          <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center border-b">
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-full object-contain p-2"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 rounded-full"
                onClick={() => handleEdit(file)}
                title="Edit File"
              >
                <Edit size={14} />
              </Button>
              <Button 
                size="icon" 
                variant="destructive" 
                className="h-8 w-8 rounded-full"
                onClick={() => handleDelete(file.id)}
                title="Delete File"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <p className="text-xs font-medium text-gray-900 truncate mb-1" title={file.name}>
              {file.name}
            </p>
            <p className="text-[10px] text-gray-500 mb-2 truncate">
              {file.dimensions} • {file.size}
            </p>
            <div className="mt-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-[10px]"
                onClick={() => copyToClipboard(file.url)}
              >
                Copy URL
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileGrid;
