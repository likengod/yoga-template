import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Video, LayoutGrid, List } from 'lucide-react';
import { OnlineClass } from '@/types/admin';
import AdminClassForm from './admin/AdminClassForm';
import AdminClassList from './admin/AdminClassList';
import AdminHeader from './admin/AdminHeader';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import AdminEmptyState from './admin/AdminEmptyState';
import { useClassesData } from '@/hooks/useClassesData';
import { Badge } from '@/components/ui/badge';

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

  if (isLoading) {
    return <AdminLoadingSpinner message="Loading online yoga classes..." />;
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Manage Classes"
        description="Create, edit, and organize online yoga sessions and schedules"
        icon={Video}
        badge={
          <Badge variant="outline" className="text-yoga-forest border-yoga-sage/30 bg-yoga-sage/10 font-medium">
            {classes.length} {classes.length === 1 ? 'class' : 'classes'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-yoga-sage/30 rounded-lg p-1 shadow-xs">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 px-2.5 text-xs ${viewMode === 'list' ? 'bg-yoga-sage text-white' : 'text-yoga-forest'}`}
              >
                <List size={14} className="mr-1.5" />
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 px-2.5 text-xs ${viewMode === 'grid' ? 'bg-yoga-sage text-white' : 'text-yoga-forest'}`}
              >
                <LayoutGrid size={14} className="mr-1.5" />
                Grid
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingClass(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-yoga-sage hover:bg-yoga-forest text-white h-9 text-sm font-medium shadow-sm">
                  <Plus size={16} className="mr-1.5" />
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
        }
      />

      {classes.length === 0 ? (
        <AdminEmptyState
          title="No Classes Found"
          description="You haven't scheduled any online classes yet. Click below to add your first session."
          icon={Video}
          actionText="Add New Class"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <AdminClassList 
          classes={classes} 
          viewMode={viewMode} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
};

export default AdminClasses;
