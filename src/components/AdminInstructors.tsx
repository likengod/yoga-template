import React, { useState, useEffect } from 'react';
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
import AdminPagination from './admin/AdminPagination';

interface Instructor extends InstructorBase {}

const AdminInstructors = () => {
  const { toast } = useToast();
  
  const { instructors, isLoading, createInstructor, updateInstructor, deleteInstructor } = useInstructorsData();
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [instructorUsers, setInstructorUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      // Load ALL users (not just instructors) so admin can connect any account
      setInstructorUsers(storedUsers);
    };
    loadUsers();
  }, []);

  const filteredUserResults = userSearch.trim().length >= 1
    ? instructorUsers.filter((u: any) =>
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 8)
    : [];

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
      signature_url: '',
      featured: false,
      tiktok: '',
      connected_user: ''
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
                <Label>Signature Image</Label>
                <div className="mt-2">
                  <ImagePicker 
                    value={editingInstructor.signature_url || ''} 
                    onChange={(val) => updateInstructorField('signature_url', val)} 
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="signature_url" className="text-xs text-muted-foreground">Or Signature Image URL</Label>
                  <Input
                    id="signature_url"
                    value={editingInstructor.signature_url || ''}
                    onChange={(val) => updateInstructorField('signature_url', val.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <div>
                <Label htmlFor="tiktok">TikTok URL</Label>
                <Input
                  id="tiktok"
                  value={editingInstructor.tiktok || ''}
                  onChange={(e) => updateInstructorField('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@..."
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

          <div className="mt-6 border-t pt-6">
            <Label>Connect User Account</Label>
            <p className="text-xs text-yoga-forest/70 mb-3">Search by username, email, or phone to link a user account to this instructor profile</p>

            {/* Currently connected badge */}
            {editingInstructor.connected_user && (
              <div className="flex items-center gap-2 mb-3 bg-yoga-sage/10 border border-yoga-sage/30 rounded-lg px-3 py-2">
                <span className="text-yoga-sage text-sm">✅</span>
                <span className="text-sm text-yoga-forest">Currently connected: <strong>{editingInstructor.connected_user}</strong></span>
                <button
                  type="button"
                  onClick={() => { updateInstructorField('connected_user', ''); setUserSearch(''); }}
                  className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium"
                >Disconnect</button>
              </div>
            )}

            <div className="relative max-w-md">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setShowUserDropdown(true); }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Search username, email, or phone..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yoga-sage bg-white h-10"
                />
              </div>

              {/* Dropdown results */}
              {showUserDropdown && userSearch.trim().length >= 1 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                  {filteredUserResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No users found matching "{userSearch}"</div>
                  ) : (
                    filteredUserResults.map((u: any) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          updateInstructorField('connected_user', u.username);
                          setUserSearch('');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-yoga-sage/10 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="font-medium text-sm text-yoga-forest">{u.username}</span>
                            {u.email && <span className="text-xs text-gray-500 ml-2">{u.email}</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {u.phone && <span className="text-xs text-gray-400">{u.phone}</span>}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              u.role === 'instructor' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{u.role}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Click-outside to close */}
            {showUserDropdown && (
              <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
            )}
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
          <AdminPagination 
            currentPage={currentPage}
            totalPages={Math.ceil(instructors.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;
