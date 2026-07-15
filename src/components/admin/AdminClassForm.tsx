import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OnlineClass } from '@/types/admin';
import { useInstructorsData } from '@/hooks/useInstructorsData';

interface AdminClassFormProps {
  initialData: OnlineClass | null;
  onSubmit: (data: Partial<OnlineClass>) => void;
  onCancel: () => void;
}

const AdminClassForm: React.FC<AdminClassFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const { instructors, isLoading: isLoadingInstructors } = useInstructorsData();
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<Partial<OnlineClass>>({
    title: '',
    instructor: '',
    classStarting: '',
    description: '',
    price: '',
    priceUSD: '',
    duration: '',
    capacity: '',
    schedule: '',
    level: 'All Levels',
    rating: 5.0,
    features: [],
    image: '',
    joinLink: '',
    maxSeats: 15,
    availableSeats: 15,
    featured: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        features: [...initialData.features],
        maxSeats: initialData.maxSeats || 15,
        availableSeats: initialData.availableSeats || initialData.maxSeats || 15
      });
    } else {
      setFormData({
        title: '',
        instructor: '',
        classStarting: '',
        description: '',
        price: '',
        priceUSD: '',
        duration: '',
        capacity: '',
        schedule: '',
        level: 'All Levels',
        rating: 5.0,
        features: [],
        image: '',
        joinLink: '',
        maxSeats: 15,
        availableSeats: 15,
        featured: false
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructor || !formData.price) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    onSubmit(formData);
  };

  const addFeature = () => {
    if (newFeature.trim() && formData.features) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    if (formData.features) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Class Title *</Label>
          <Select 
            value={formData.title} 
            onValueChange={(value) => setFormData({...formData, title: value})}
          >
            <SelectTrigger id="title">
              <SelectValue placeholder="Select a class type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hatha Yoga">Hatha Yoga</SelectItem>
              <SelectItem value="Ashtanga Yoga">Ashtanga Yoga</SelectItem>
              <SelectItem value="Vinyasa Flow">Vinyasa Flow</SelectItem>
              <SelectItem value="Meditation Session">Meditation Session</SelectItem>
              <SelectItem value="Pranayama Workshop">Pranayama Workshop</SelectItem>
              <SelectItem value="Beginners Class">Beginners Class</SelectItem>
              <SelectItem value="Advanced Practice">Advanced Practice</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Label htmlFor="instructor">Instructor *</Label>
          <div className="relative">
            <Input
              id="instructor"
              value={formData.instructor || ''}
              onChange={(e) => {
                setFormData({...formData, instructor: e.target.value});
                setShowInstructorDropdown(true);
              }}
              onFocus={() => setShowInstructorDropdown(true)}
              placeholder="e.g., Raai Kotha"
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
                    {!instructors.some((inst: any) => inst.name.toLowerCase() === (formData.instructor || '').toLowerCase()) && formData.instructor && formData.instructor.trim() !== '' && (
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
                    {instructors.filter((inst: any) => inst.name.toLowerCase().includes((formData.instructor || '').toLowerCase())).length === 0 && (!formData.instructor || formData.instructor.trim() === '') && (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center">No instructors found. Type to enter a custom name.</div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="classStarting">Class Starting</Label>
        <Input
          id="classStarting"
          value={formData.classStarting}
          onChange={(e) => setFormData({...formData, classStarting: e.target.value})}
          placeholder="e.g., January 15, 2024 or Next Monday"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe the class..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="price">Price (INR) *</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="e.g., ₹1,200"
            required
          />
        </div>
        <div>
          <Label htmlFor="priceUSD">Price (USD)</Label>
          <Input
            id="priceUSD"
            value={formData.priceUSD || ''}
            onChange={(e) => setFormData({...formData, priceUSD: e.target.value})}
            placeholder="e.g., $15"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="e.g., 60 minutes"
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            placeholder="e.g., 15 students"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            value={formData.schedule}
            onChange={(e) => setFormData({...formData, schedule: e.target.value})}
            placeholder="e.g., Mon, Wed, Fri - 7:00 AM IST"
          />
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Levels">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 5.0})}
            placeholder="5.0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxSeats">Maximum Seats</Label>
          <Input
            id="maxSeats"
            type="number"
            min="1"
            value={formData.maxSeats}
            onChange={(e) => {
              const maxSeats = parseInt(e.target.value) || 15;
              setFormData({
                ...formData, 
                maxSeats,
                availableSeats: Math.min(formData.availableSeats || maxSeats, maxSeats)
              });
            }}
            placeholder="15"
          />
        </div>
        <div>
          <Label htmlFor="availableSeats">Available Seats</Label>
          <Input
            id="availableSeats"
            type="number"
            min="0"
            max={formData.maxSeats || 15}
            value={formData.availableSeats}
            onChange={(e) => setFormData({...formData, availableSeats: parseInt(e.target.value) || 0})}
            placeholder="15"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        <div>
          <Label htmlFor="joinLink">Join Link</Label>
          <Input
            id="joinLink"
            value={formData.joinLink}
            onChange={(e) => setFormData({...formData, joinLink: e.target.value})}
            placeholder="https://meet.google.com/..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-2 pb-4">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
        />
        <Label htmlFor="featured" className="cursor-pointer">Feature this class on the homepage</Label>
      </div>

      <div>
        <Label>Features</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add a feature..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
          />
          <Button type="button" onClick={addFeature} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.features?.map((feature, index) => (
            <div key={index} className="bg-yoga-sage/10 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <span>{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-yoga-sage hover:bg-yoga-forest">
          <Save size={16} className="mr-2" />
          {initialData ? 'Update' : 'Create'} Class
        </Button>
      </div>
    </form>
  );
};

export default AdminClassForm;
