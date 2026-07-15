
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, Phone, Mail, Clock, UserCheck, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bookingService } from '@/services/database';
import { useInstructorsData } from '@/hooks/useInstructorsData';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClassType?: string;
  defaultInstructorName?: string;
}

const BookingDialog = ({ open, onOpenChange, defaultClassType, defaultInstructorName }: BookingDialogProps) => {
  const { toast } = useToast();
  const { instructors } = useInstructorsData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    classType: '',
    instructor: '',
    preferredDate: '',
    preferredTime: '',
    experience: '',
    specialRequests: ''
  });

  const [classOpen, setClassOpen] = useState(false);
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [classTypes, setClassTypes] = useState<string[]>([
    'Hatha Yoga', 'Ashtanga Yoga', 'Vinyasa Flow', 'Meditation Session', 
    'Pranayama Workshop', 'Beginners Class', 'Advanced Practice'
  ]);

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        classType: defaultClassType || prev.classType,
        instructor: defaultInstructorName || prev.instructor
      }));
    }
  }, [open, defaultClassType, defaultInstructorName]);

  useEffect(() => {
    const loadClasses = () => {
      const storedClasses = localStorage.getItem('onlineClasses');
      if (storedClasses) {
        try {
          const parsed = JSON.parse(storedClasses) as any[];
          if (parsed.length > 0) {
            setClassTypes(parsed.map(c => c.title));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadClasses();
    window.addEventListener('storage', loadClasses);
    window.addEventListener('classesUpdated', loadClasses);
    return () => {
      window.removeEventListener('storage', loadClasses);
      window.removeEventListener('classesUpdated', loadClasses);
    };
  }, []);

  const timeSlots = ['6:00 AM - 7:00 AM', '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'];
  const experienceLevels = ['Complete Beginner', 'Some Experience (1-6 months)', 'Intermediate (6 months - 2 years)', 'Advanced (2+ years)', 'Teacher/Professional'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.classType || !formData.preferredDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      // Create booking record in database mapping to snake_case for Prisma
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class_type: formData.classType,
        instructor: formData.instructor,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        experience: formData.experience,
        special_requests: formData.specialRequests
      };
      await bookingService.createBooking(payload);

      toast({
        title: "Booking Submitted",
        description: "Your class booking has been submitted successfully. We'll contact you soon to confirm your session."
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        phone: '',
        classType: '',
        instructor: '',
        preferredDate: '',
        preferredTime: '',
        experience: '',
        specialRequests: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('BookingDialog: Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: "Failed to submit booking. Please try again."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-32">
          <DialogTitle className="flex items-center gap-2 text-yoga-forest text-base font-bold">
            <Calendar className="text-yoga-sage" size={24} />
            Book Your Yoga Class
          </DialogTitle>
          <DialogDescription className="sr-only">
            Please fill out the form below to book a yoga class.
          </DialogDescription>
        </DialogHeader>

        {/* Absolute positioned dev partner badge, scaled down, placed below top-right close icon */}
        <div className="absolute top-12 right-4 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded border border-blue-100 shadow-sm text-right">
          <div className="text-[9px] font-medium leading-none mb-0.5" style={{ color: '#2563eb' }}>Digital Dev partner</div>
          <a 
            href="https://gorillatechsolution.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline font-semibold text-[11px] hover:opacity-80 transition-opacity leading-none block" 
            style={{ color: '#335299', fontFamily: 'Inter, sans-serif' }}
          >
            Gorilla Tech Solution
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yoga-forest border-b border-yoga-sage/20 pb-2">
              Personal Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1 py-[3px]">
                  <User size={16} />
                  Full Name *
                </Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => handleInputChange('name', e.target.value)} 
                  placeholder="Enter your full name" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone size={16} />
                  Phone Number *
                </Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={e => handleInputChange('phone', e.target.value)} 
                  placeholder="+91 XXXXX XXXXX" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail size={16} />
                Email Address *
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={e => handleInputChange('email', e.target.value)} 
                placeholder="your.email@example.com" 
                required 
              />
            </div>
          </div>

          {/* Class Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yoga-forest border-b border-yoga-sage/20 pb-2">
              Class Details
            </h3>
            
            <div>
              <Label htmlFor="classType">Class Type *</Label>
              <select
                id="classType"
                value={formData.classType}
                onChange={e => handleInputChange('classType', e.target.value)}
                className="w-full mt-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yoga-sage cursor-pointer h-10"
                required
              >
                <option value="" disabled>Select a class type</option>
                {classTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="instructor" className="flex items-center gap-1">
                <UserCheck size={16} />
                Select Instructor
              </Label>
              <select
                id="instructor"
                value={formData.instructor}
                onChange={e => handleInputChange('instructor', e.target.value)}
                className="w-full mt-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yoga-sage cursor-pointer h-10"
              >
                <option value="">Choose your preferred instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.name}>
                    {instructor.name} — {instructor.specialization}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input 
                  id="preferredDate" 
                  type="date" 
                  value={formData.preferredDate} 
                  onChange={e => handleInputChange('preferredDate', e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="preferredTime" className="flex items-center gap-1">
                  <Clock size={16} />
                  Preferred Time
                </Label>
                <select
                  id="preferredTime"
                  value={formData.preferredTime}
                  onChange={e => handleInputChange('preferredTime', e.target.value)}
                  className="w-full mt-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yoga-sage cursor-pointer h-10"
                >
                  <option value="" disabled>Select time slot</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                value={formData.experience}
                onChange={e => handleInputChange('experience', e.target.value)}
                className="w-full mt-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yoga-sage cursor-pointer h-10"
              >
                <option value="" disabled>Select your experience level</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="specialRequests">Special Requests or Health Considerations</Label>
              <Textarea 
                id="specialRequests" 
                value={formData.specialRequests} 
                onChange={e => handleInputChange('specialRequests', e.target.value)} 
                placeholder="Any injuries, health conditions, or special requests we should know about..." 
                rows={3} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-yoga-sage hover:bg-yoga-forest">
              Submit Booking
            </Button>
          </div>

          {/* Digital Dev Partner */}
          <div className="pt-4 border-t border-yoga-sage/20">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-2 rounded-md shadow-sm border border-gray-200">
              <p className="text-xs text-center">
                <span className="font-medium" style={{ color: '#1e40af' }}>Digital Dev partner:</span>{' '}
                <a 
                  href="https://gorillatechsolution.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline font-semibold hover:opacity-80 transition-opacity" 
                  style={{ color: '#335299', fontFamily: 'Inter, sans-serif' }}
                >
                  Gorilla Tech Solution
                </a>
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
