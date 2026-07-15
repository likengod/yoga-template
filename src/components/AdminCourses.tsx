import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coursesService, Course, CourseVideo } from '@/services/coursesService';
import { Plus, Trash, Edit2, Play, PlusCircle, X, Search, ImageIcon, Info, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useInstructorsData } from '@/hooks/useInstructorsData';

const AdminCourses = () => {
  const { toast } = useToast();
  const { instructors, isLoading: isLoadingInstructors } = useInstructorsData();
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    price: 0,
    priceUSD: 0,
    thumbnail: '',
    instructor: 'Sushmita Debnath',
    duration: '',
    level: 'Beginner' as Course['level'],
    category: '',
    published: true,
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const [videos, setVideos] = useState<CourseVideo[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setCourses(coursesService.getCourses());
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      price: 1999,
      priceUSD: 24,
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      instructor: 'Sushmita Debnath',
      duration: '4 hours',
      level: 'Beginner',
      category: 'Hatha',
      published: true,
      featured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setVideos([
      { id: 'v-' + Date.now() + '-1', title: 'Introduction & Welcome', description: 'Intro to course curriculum and goals.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '15 mins', order: 1 }
    ]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      longDescription: course.longDescription,
      price: course.price,
      priceUSD: course.priceUSD ?? Math.round(course.price / 83),
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      category: course.category,
      published: course.published,
      featured: course.featured ?? false,
      seoTitle: course.seoTitle || '',
      seoDescription: course.seoDescription || '',
      seoKeywords: course.seoKeywords || '',
    });
    setVideos(course.videos || []);
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      coursesService.deleteCourse(id);
      setSelectedCourses(prev => prev.filter(cId => cId !== id));
      loadCourses();
      toast({
        title: "Course Deleted",
        description: "The course was successfully removed."
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedCourses.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedCourses.length} selected courses?`)) {
      selectedCourses.forEach(id => coursesService.deleteCourse(id));
      setSelectedCourses([]);
      loadCourses();
      toast({
        title: "Courses Deleted",
        description: "The selected courses were successfully removed."
      });
    }
  };

  // Video Management inside Form
  const handleAddVideoField = () => {
    const nextOrder = videos.length + 1;
    const newVid: CourseVideo = {
      id: 'v-' + Date.now() + '-' + nextOrder,
      title: `Part ${nextOrder} - Lesson Title`,
      description: 'Enter video description.',
      source: 'https://www.youtube.com/embed/v7AYKMP6rOE',
      duration: '20 mins',
      order: nextOrder
    };
    setVideos([...videos, newVid]);
  };

  const handleRemoveVideoField = (id: string) => {
    const updated = videos.filter(v => v.id !== id).map((v, index) => ({
      ...v,
      order: index + 1 // Re-order sequentially
    }));
    setVideos(updated);
  };

  const handleVideoFieldChange = (id: string, field: keyof CourseVideo, val: any) => {
    const updated = videos.map(v => {
      if (v.id === id) {
        return { ...v, [field]: val };
      }
      return v;
    });
    setVideos(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (videos.length === 0) {
      toast({
        variant: "destructive",
        title: "Curriculum Required",
        description: "Please add at least 1 video lesson/preview to your course."
      });
      return;
    }

    const coursePayload: Course = {
      id: editingCourse ? editingCourse.id : 'course-' + Date.now(),
      title: formData.title,
      description: formData.description,
      longDescription: formData.longDescription,
      price: Number(formData.price),
      priceUSD: formData.priceUSD ? Number(formData.priceUSD) : undefined,
      thumbnail: formData.thumbnail,
      instructor: formData.instructor,
      duration: formData.duration,
      level: formData.level,
      category: formData.category,
      published: formData.published,
      featured: formData.featured,
      videos: videos.sort((a, b) => a.order - b.order),
      enrolledCount: editingCourse ? editingCourse.enrolledCount : 0,
      rating: editingCourse ? editingCourse.rating : 4.8,
      includes: editingCourse ? editingCourse.includes : [`${videos.length} HD video lessons`, 'Lifetime access', 'Certificate on completion'],
      createdAt: editingCourse ? editingCourse.createdAt : new Date().toISOString().split('T')[0],
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      seoKeywords: formData.seoKeywords || undefined,
    };

    coursesService.saveCourse(coursePayload);
    setIsDialogOpen(false);
    loadCourses();
    toast({
      title: editingCourse ? "Course Updated" : "Course Created",
      description: `Course "${formData.title}" saved successfully.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Video Courses</h2>
          <p className="text-yoga-forest/70">Create and modify online sequential courses for students ({courses.length} courses)</p>
        </div>
        <div className="flex gap-2">
          {selectedCourses.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash size={16} className="mr-2" /> Delete ({selectedCourses.length})
            </Button>
          )}
          <Button onClick={handleOpenCreate} className="bg-yoga-sage hover:bg-yoga-forest">
            <Plus size={16} className="mr-2" /> Add Course
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-yoga-cream/30">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={courses.length > 0 && courses.every(c => selectedCourses.includes(c.id))}
                    onCheckedChange={(checked) => {
                      setSelectedCourses(checked ? courses.map(c => c.id) : []);
                    }}
                    className="border-yoga-forest text-yoga-forest"
                  />
                </TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-yoga-forest/50">
                    No courses found. Click "Add Course" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={(checked) => {
                          setSelectedCourses(prev => checked ? [...prev, course.id] : prev.filter(id => id !== course.id));
                        }}
                        className="border-yoga-forest text-yoga-forest"
                      />
                    </TableCell>
                    <TableCell>
                      <img src={course.thumbnail} alt={course.title} className="w-12 h-10 object-cover rounded-lg border" />
                    </TableCell>
                    <TableCell className="font-semibold text-yoga-forest">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>{course.level}</TableCell>
                    <TableCell>₹{course.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{course.videos.length} videos</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        course.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(course)} className="text-blue-600 hover:bg-blue-50">
                          <Edit2 size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:bg-red-50">
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-yoga-forest">
              {editingCourse ? 'Modify Course Details' : 'Create New Course'}
            </DialogTitle>
            <DialogDescription>
              Provide metadata, information details, and configure the curriculum list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Metadata Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input 
                  id="course-title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-category">Category / Topic</Label>
                <Input 
                  id="course-category" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  placeholder="e.g. Hatha, Meditation, Vinyasa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-price">Price — Indian Rupees (INR ₹)</Label>
                <Input 
                  id="course-price" 
                  type="number" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-price-usd">
                  Price — US Dollars (USD $)
                  <span className="ml-2 text-[10px] text-yoga-forest/40 font-normal">for international visitors</span>
                </Label>
                <Input 
                  id="course-price-usd" 
                  type="number" 
                  value={formData.priceUSD} 
                  onChange={e => setFormData({...formData, priceUSD: Number(e.target.value)})} 
                  placeholder={`Auto: $${formData.price ? Math.round(formData.price / 83) : 0}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-duration">Total Duration</Label>
                <Input 
                  id="course-duration" 
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: e.target.value})} 
                  placeholder="e.g. 5 hours"
                  required
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-yoga-sage" />
                  Featured Image
                  <span className="ml-auto text-[10px] font-normal text-yoga-forest/50 bg-yoga-cream px-2 py-0.5 rounded-full">
                    Also used as Social Media OG Image
                  </span>
                </Label>

                {/* Live Preview */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-dashed border-yoga-sage/40 bg-yoga-cream/20 group">
                  {formData.thumbnail ? (
                    <>
                      <img
                        src={formData.thumbnail}
                        alt="Featured preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                          📸 Featured Image Preview
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <span className="text-white text-[10px] bg-yoga-sage/80 px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                          OG Image ✓
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-yoga-forest/40">
                      <ImageIcon size={36} className="opacity-40" />
                      <p className="text-sm">Paste an image URL below to preview</p>
                    </div>
                  )}
                </div>

                {/* URL Input */}
                <Input
                  id="course-thumbnail"
                  value={formData.thumbnail}
                  onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                  placeholder="https://your-image-url.com/image.jpg"
                  required
                />

                {/* Size guidance */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-blue-700 space-y-0.5">
                    <p className="font-semibold">Recommended image sizes:</p>
                    <ul className="space-y-0.5 text-blue-600">
                      <li>• <strong>Course Card / Thumbnail:</strong> 600 × 400 px (3:2 ratio)</li>
                      <li>• <strong>Facebook / WhatsApp OG share:</strong> 1200 × 630 px (min. 600 × 315 px)</li>
                      <li>• <strong>Twitter (X) Card:</strong> 1200 × 628 px</li>
                      <li>• <strong>Max file size:</strong> Under 2 MB for fast loading</li>
                    </ul>
                    <p className="mt-1 text-blue-500 italic">This same image is automatically used when someone shares this course on Facebook, WhatsApp, Twitter, etc.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-level">Skill Level</Label>
                <Select value={formData.level} onValueChange={(val: any) => setFormData({...formData, level: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="course-instructor">Instructor</Label>
                <div className="relative">
                  <Input 
                    id="course-instructor" 
                    value={formData.instructor} 
                    onChange={e => {
                      setFormData({...formData, instructor: e.target.value});
                      setShowInstructorDropdown(true);
                    }} 
                    onFocus={() => setShowInstructorDropdown(true)}
                    placeholder="Type or select instructor name..."
                    required
                  />
                  <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {showInstructorDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowInstructorDropdown(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto p-1.5 space-y-1">
                      {isLoadingInstructors ? (
                        <div className="px-3 py-2 text-xs text-gray-500">Loading instructors...</div>
                      ) : (
                        <>
                          {instructors
                            .filter((inst: any) => inst.name.toLowerCase().includes((formData.instructor || '').toLowerCase()))
                            .map((inst: any) => (
                              <button
                                key={inst.id}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, instructor: inst.name});
                                  setShowInstructorDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-yoga-forest hover:bg-yoga-cream/40 rounded-lg transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-semibold text-yoga-forest">{inst.name}</div>
                                  <div className="text-[10px] text-yoga-forest/50">{inst.title || inst.specialization}</div>
                                </div>
                                {formData.instructor === inst.name && (
                                  <span className="text-yoga-sage text-xs font-bold">✓</span>
                                )}
                              </button>
                            ))
                          }
                          {!instructors.some((inst: any) => inst.name.toLowerCase() === (formData.instructor || '').toLowerCase()) && formData.instructor.trim() !== '' && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowInstructorDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors italic border-t"
                            >
                              Use custom name: "{formData.instructor}"
                            </button>
                          )}
                          {instructors.filter((inst: any) => inst.name.toLowerCase().includes((formData.instructor || '').toLowerCase())).length === 0 && formData.instructor.trim() === '' && (
                            <div className="px-3 py-2 text-xs text-gray-500 text-center">No instructors found. Type to enter a custom name.</div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-published">Publish Status</Label>
                <Select value={formData.published ? 'yes' : 'no'} onValueChange={val => setFormData({...formData, published: val === 'yes'})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Published status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Published (Visible on site)</SelectItem>
                    <SelectItem value="no">Draft (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Toggle */}
              <div className="space-y-2">
                <Label htmlFor="course-featured">Featured Course</Label>
                <Select value={formData.featured ? 'yes' : 'no'} onValueChange={val => setFormData({...formData, featured: val === 'yes'})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">
                      <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-yoga-terracotta" /> Featured (shows first)</span>
                    </SelectItem>
                    <SelectItem value="no">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-yoga-forest/40">Featured courses appear at the top of the courses page.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-desc">Short Description (Cards & Sharing Preview)</Label>
              <Input 
                id="course-desc" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-long-desc">Long Description (Detailed overview)</Label>
              <Textarea 
                id="course-long-desc" 
                value={formData.longDescription} 
                onChange={e => setFormData({...formData, longDescription: e.target.value})} 
                rows={3}
                required
              />
            </div>

            {/* Course Custom SEO Config */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-bold text-yoga-forest flex items-center gap-1.5">
                <Search size={18} className="text-yoga-sage" />
                <span>SEO Configurations (Custom Meta Details)</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-seo-title">Custom Meta Title</Label>
                  <Input 
                    id="course-seo-title" 
                    value={formData.seoTitle} 
                    onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
                    placeholder="e.g. Master Hatha Yoga | Shakti Yoga"
                  />
                  <p className="text-[10px] text-yoga-forest/40">Overrides the default title in search engine snippets and social sharing posts.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-seo-keywords">Custom Meta Keywords</Label>
                  <Input 
                    id="course-seo-keywords" 
                    value={formData.seoKeywords} 
                    onChange={e => setFormData({...formData, seoKeywords: e.target.value})} 
                    placeholder="yoga, hatha, sushmita, classes, shakti"
                  />
                  <p className="text-[10px] text-yoga-forest/40">Comma-separated tags to describe this course content to search engines.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="course-seo-desc">Custom Meta Description</Label>
                  <Textarea 
                    id="course-seo-desc" 
                    value={formData.seoDescription} 
                    onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                    placeholder="Specify a targeted summary under 160 characters for search engines."
                    rows={2}
                  />
                  <p className="text-[10px] text-yoga-forest/40">Overrides the short description snippet when this page link is shared on Facebook or WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* Curriculum/Videos Segment */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-yoga-forest flex items-center gap-1.5">
                  <Play size={18} className="text-yoga-sage" />
                  <span>Curriculum Plan (Video Lessons & Preview)</span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddVideoField} className="border-yoga-sage text-yoga-sage">
                  <PlusCircle size={16} className="mr-1.5" /> Add Lesson Part
                </Button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {videos.map((vid, idx) => (
                  <div key={vid.id} className="p-4 border rounded-2xl bg-yoga-cream/10 space-y-3 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-yoga-sage bg-yoga-cream px-2 py-0.5 rounded">Part {vid.order}</span>
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveVideoField(vid.id)} className="text-red-500 h-7 w-7">
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 pr-12">
                      <div className="space-y-1">
                        <Label className="text-xs">Lesson Title</Label>
                        <Input 
                          value={vid.title} 
                          onChange={e => handleVideoFieldChange(vid.id, 'title', e.target.value)} 
                          required 
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Duration (e.g. 15 mins)</Label>
                        <Input 
                          value={vid.duration} 
                          onChange={e => handleVideoFieldChange(vid.id, 'duration', e.target.value)} 
                          required 
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Video Source URL (Google Drive Embed / YouTube Embed / Raw MP4 link)</Label>
                        <Input 
                          value={vid.source} 
                          onChange={e => handleVideoFieldChange(vid.id, 'source', e.target.value)} 
                          required 
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Lesson Short Description</Label>
                        <Input 
                          value={vid.description} 
                          onChange={e => handleVideoFieldChange(vid.id, 'description', e.target.value)} 
                          required 
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" className="bg-yoga-sage hover:bg-yoga-forest text-white rounded-full">
                Save Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
