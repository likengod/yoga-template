import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { OnlineClass } from '@/types/admin';
import AdminClassForm from './admin/AdminClassForm';
import AdminClassList from './admin/AdminClassList';
import { useClassesData } from '@/hooks/useClassesData';

const AdminClasses = () => {
  const { toast } = useToast();
  const { classes, isLoading, createClass, updateClass, deleteClass } = useClassesData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<OnlineClass | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleEdit = (classToEdit: OnlineClass) => {
    setEditingClass(classToEdit);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: Partial<OnlineClass>) => {
    if (editingClass) {
      await updateClass({ id: editingClass.id, data: formData });
      toast({
        title: "Class Updated",
        description: "The class has been updated successfully."
      });
    } else {
      const classData: OnlineClass = {
        ...formData,
        id: Date.now().toString(),
      } as OnlineClass;
      await createClass(classData);
      toast({
        title: "Class Created",
        description: "New class has been added successfully."
      });
    }
    setIsDialogOpen(false);
    setEditingClass(null);
  };

  const handleDelete = async (id: string) => {
    await deleteClass(id);
    toast({
      title: "Class Deleted",
      description: "The class has been deleted successfully."
    });
  };

  if (isLoading) return <div>Loading classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Classes</h2>
          <p className="text-yoga-forest/70">Create, edit, and manage online yoga classes ({classes.length} classes)</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-yoga-sage text-white' : ''}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-yoga-sage text-white' : ''}
            >
              Grid
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingClass(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-yoga-sage hover:bg-yoga-forest">
                <Plus size={16} className="mr-2" />
                Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </DialogTitle>
              </DialogHeader>
              <AdminClassForm 
                initialData={editingClass}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AdminClassList 
        classes={classes} 
        viewMode={viewMode} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default AdminClasses;
