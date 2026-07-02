import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImagePicker from './ImagePicker';
import { Save, Plus, Edit, Trash2, Star, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useInstructorsData, type InstructorBase } from '@/hooks/useInstructorsData';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Instructor extends InstructorBase {}

const AdminInstructors = () => {
  const { toast } = useToast();
  
  const { instructors, isLoading, createInstructor, updateInstructor, deleteInstructor } = useInstructorsData();
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSave = () => {
    toast({
      title: "Instructors Updated",
      description: "The instructors data has been updated successfully.",
    });
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingInstructor({
      id: Date.now().toString(),
      name: '',
      title: '',
      specialization: '',
      experience: '',
      certifications: [],
      rating: 5.0,
      students: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      featured: false
    });
    setIsCreating(true);
  };

  const handleSaveInstructor = async () => {
    if (editingInstructor) {
      if (isCreating) {
        await createInstructor(editingInstructor);
      } else {
        await updateInstructor({ id: editingInstructor.id, data: editingInstructor });
      }
      
      setEditingInstructor(null);
      setIsCreating(false);
      
      toast({
        title: isCreating ? "Instructor Created" : "Instructor Updated",
        description: isCreating ? "New instructor has been added." : "Instructor details have been updated.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInstructor(id);
    
    toast({
      title: "Instructor Deleted",
      description: "Instructor has been deleted successfully.",
    });
  };

  const updateInstructorField = (field: keyof Instructor, value: any) => {
    if (editingInstructor) {
      setEditingInstructor({ ...editingInstructor, [field]: value });
    }
  };

  if (editingInstructor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yoga-forest">
            {isCreating ? 'Add New Instructor' : 'Edit Instructor'}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditingInstructor(null)}>Cancel</Button>
            <Button onClick={handleSaveInstructor} className="bg-yoga-sage hover:bg-yoga-forest">
              <Save size={16} className="mr-2" />
              Save Instructor
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingInstructor.name}
                  onChange={(e) => updateInstructorField('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title/Role</Label>
                <Input
                  id="title"
                  value={editingInstructor.title}
                  onChange={(e) => updateInstructorField('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={editingInstructor.specialization}
                  onChange={(e) => updateInstructorField('specialization', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={editingInstructor.experience}
                    onChange={(e) => updateInstructorField('experience', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="students">Students Taught</Label>
                  <Input
                    id="students"
                    value={editingInstructor.students}
                    onChange={(e) => updateInstructorField('students', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label>Profile Image</Label>
                <div className="mt-2">
                  <ImagePicker 
                    value={editingInstructor.image} 
                    onChange={(val) => updateInstructorField('image', val)} 
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="image" className="text-xs text-muted-foreground">Or Image URL</Label>
                  <Input
                    id="image"
                    value={editingInstructor.image}
                    onChange={(val) => updateInstructorField('image', val.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingInstructor.description}
                  onChange={(e) => updateInstructorField('description', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-yoga-forest mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={editingInstructor.instagram || ''}
                  onChange={(e) => updateInstructorField('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={editingInstructor.facebook || ''}
                  onChange={(e) => updateInstructorField('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={editingInstructor.twitter || ''}
                  onChange={(e) => updateInstructorField('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={editingInstructor.linkedin || ''}
                  onChange={(e) => updateInstructorField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-yoga-forest">Feature Instructor</h3>
                <p className="text-xs text-yoga-forest/70">Display this instructor prominently on the homepage</p>
              </div>
              <Switch
                checked={editingInstructor.featured || false}
                onCheckedChange={(checked) => updateInstructorField('featured', checked)}
              />
            </div>
          </div>
          
        </Card>
      </div>
    );
  }

  if (isLoading) return <div>Loading instructors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yoga-forest">
          Manage Instructors ({instructors.length} total)
        </h2>
        <Button onClick={handleCreateNew} className="bg-yoga-sage hover:bg-yoga-forest">
          <Plus size={16} className="mr-2" />
          Add New Instructor
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Filter instructors by name, specialization, or type 'featured'..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="grid gap-4">
        {instructors
          .filter(inst => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            if (q === 'featured') return inst.featured;
            return inst.name.toLowerCase().includes(q) || 
                   inst.specialization.toLowerCase().includes(q) ||
                   inst.title.toLowerCase().includes(q);
          })
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((instructor) => (
          <Card key={instructor.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <img loading="lazy" 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
                <div>
                  <h3 className="text-lg font-bold text-yoga-forest flex items-center">
                    {instructor.name}
                    {instructor.featured && (
                      <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-yellow-500" />
                    )}
                  </h3>
                  <p className="text-yoga-terracotta font-medium text-sm">{instructor.title}</p>
                  <p className="text-yoga-forest/70 text-xs">{instructor.specialization}</p>
                  <p className="text-yoga-forest/70 text-xs">{instructor.experience} ? {instructor.students} students ? {instructor.rating}?</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(instructor)}
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(instructor.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            <p className="text-yoga-forest/80 mt-2 text-sm leading-relaxed">{instructor.description}</p>
          </Card>
        ))}
      </div>

      {instructors.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.ceil(instructors.length / itemsPerPage) }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(instructors.length / itemsPerPage)))}
                  className={currentPage === Math.ceil(instructors.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;
