
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

const BookingDialog = ({ open, onOpenChange, defaultClassType }: BookingDialogProps) => {
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
    if (open && defaultClassType) {
      setFormData(prev => ({ ...prev, classType: defaultClassType }));
    }
  }, [open, defaultClassType]);

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
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-yoga-forest text-base font-bold">
            <div className="flex items-center gap-2">
              <Calendar className="text-yoga-sage" size={24} />
              Book Your Yoga Class
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-md shadow-sm border border-blue-100">
              <div className="text-xs font-medium" style={{ color: '#2563eb' }}>Digital Dev partner</div>
              <a 
                href="https://gorillatechsolution.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline font-semibold text-sm hover:opacity-80 transition-opacity" 
                style={{ color: '#335299', fontFamily: 'Inter, sans-serif' }}
              >
                Gorilla Tech Solution
              </a>
            </div>
          </DialogTitle>
        </DialogHeader>

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
              <Popover open={classOpen} onOpenChange={setClassOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={classOpen} className="w-full justify-between font-normal mt-1">
                    {formData.classType || "Select a class type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search class..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>No class found.</CommandEmpty>
                      <CommandGroup>
                        {classTypes.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={(currentValue) => {
                              handleInputChange('classType', type);
                              setClassOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.classType === type ? "opacity-100" : "opacity-0")} />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="instructor" className="flex items-center gap-1">
                <UserCheck size={16} />
                Select Instructor
              </Label>
              <Popover open={instructorOpen} onOpenChange={setInstructorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={instructorOpen} className="w-full justify-between font-normal h-auto py-2 mt-1">
                    {formData.instructor ? (
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{formData.instructor}</span>
                      </div>
                    ) : (
                      "Choose your preferred instructor"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search instructor..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>No instructor found.</CommandEmpty>
                      <CommandGroup>
                        {instructors.map((instructor) => (
                          <CommandItem
                            key={instructor.id}
                            value={instructor.name}
                            onSelect={(currentValue) => {
                              handleInputChange('instructor', instructor.name);
                              setInstructorOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.instructor === instructor.name ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="font-medium">{instructor.name}</span>
                              <span className="text-xs text-gray-500">{instructor.specialization}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <Select value={formData.preferredTime} onValueChange={value => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={formData.experience} onValueChange={value => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
