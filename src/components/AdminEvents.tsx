
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Calendar, Clock, MapPin, Users, Link as LinkIcon, Edit } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { eventService } from '@/services/database';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  image: string;
  capacity: string;
  joinUrl: string;
  buttonText?: string;
  buttonUrl?: string;
}

const AdminEvents = () => {
  const { toast } = useToast();
  const [event, setEvent] = useState<Event>({
    id: '1',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    image: '',
    capacity: '',
    joinUrl: '',
    buttonText: '',
    buttonUrl: ''
  });

  useEffect(() => {
    const defaultEvent: Event = {
      id: '1',
      title: '5-Day Meditation, Pelvic floor Flexibility & 7 Chakra Kundalini Activation Course',
      description: `Course Overview:

Dive into a powerful spiritual journey with this intensive 5-day course focused on the 7 Chakras and Kundalini awakening. This course blends guided meditation, chakra balancing, pranayama, Kundalini kriyas, Pelvic floor flexibility Yoga and sound healing to activate and align your inner energy system.

Each day, we focus on multiple chakras in sequence, unlocking physical, emotional, and energetic healing.

⸻
🔮 What You Will Experience:
	•	Daily guided chakra meditations
	•	Kundalini energy awakening practices
	•	Breathwork (pranayama) & bandhas
	•	Sound vibration & mantra chanting
	•	Chakra healing visualizations
	•	For Pelvic Floor Flexibility Yoga
	•	Energy cleansing & grounding techniques

⸻
🔥 Daily Chakra Flow (Example Schedule):

Day 1: Root + Sacral Chakras
Focus: Grounding & emotional release

Day 2: Solar Plexus + Heart
Focus: Confidence & heart expansion

Day 3: Throat + Third Eye
Focus: Expression & intuition

Day 4: Crown Chakra + Full Chakra Cleanse
Focus: Spiritual connection & alignment

Day 5: Complete 7 Chakra Activation + Kundalini Flow
Focus: Full-body energy awakening & integration

⸻
📦 Course Includes:
	•	Live Zoom classes 
	•	Daily energy practice PDFs
	•	Private text support 
	•	Completion Certificate

⸻
👥 Who Can Join?
	•	Beginners & intermediate meditators
	•	Yoga practitioners & wellness seekers
	•	Anyone experiencing stress, blocks, or energy imbalances
	•	Healers, coaches, and spiritual guides

⸻
📝 Registration Now Open!

👉 Limited seats available for personal attention
👉 Click below to reserve your spot`,
      date: '2025-07-21',
      time: 'Morning: 5:00 AM – 6:00 AM\nEvening: 5:00 PM – 6:00 PM\n(Join as per your convenience)',
      location: 'Online via Zoom',
      price: '₹7500 INR / $120 USD',
      image: 'https://i.postimg.cc/VvCNSCSz/5-Day-Meditation.webp',
      capacity: '21 participants',
      joinUrl: 'https://wa.me/918777816410?text=Hi! I would like to join the 5-Day Meditation, Pelvic floor Flexibility & 7 Chakra Kundalini Activation Course. Please send me the details.',
      buttonText: 'Event Details',
      buttonUrl: '/admin'
    };

    const loadEvent = async () => {
      try {
        const data = await eventService.getEvent();
        if (data) {
          setEvent(data);
        } else {
          const stored = localStorage.getItem('eventData');
          if (stored) {
            setEvent(JSON.parse(stored));
          } else {
            setEvent(defaultEvent);
          }
        }
      } catch (err) {
        console.error('Failed to load event from database:', err);
        const stored = localStorage.getItem('eventData');
        if (stored) {
          setEvent(JSON.parse(stored));
        } else {
          setEvent(defaultEvent);
        }
      }
    };

    loadEvent();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price,
        image: event.image,
        capacity: event.capacity,
        joinUrl: event.joinUrl,
        buttonText: event.buttonText || '',
        buttonUrl: event.buttonUrl || ''
      };
      
      await eventService.updateEvent(payload);
      
      localStorage.setItem('eventData', JSON.stringify(event));
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Event Updated",
        description: "The event details have been updated successfully on the database."
      });
    } catch (err) {
      console.error('Failed to save event to database:', err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save event to the database. Saved locally instead."
      });
      localStorage.setItem('eventData', JSON.stringify(event));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleInputChange = (field: keyof Event, value: string) => {
    setEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar size={20} className="text-yoga-sage" />
          <h2 className="text-xl font-semibold text-yoga-forest">Event Management</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Event Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={event.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={event.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description"
                className="mt-1 h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={event.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={event.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={event.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Online via Zoom"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={event.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., ₹999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={event.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="e.g., 50 participants"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image">Event Image URL</Label>
              <div className="mt-1">
                <ImagePicker
                  id="image"
                  value={event.image}
                  onChange={(val) => handleInputChange('image', val)}
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="joinUrl">Join Button URL (WhatsApp or Registration Link)</Label>
              <Input
                id="joinUrl"
                value={event.joinUrl}
                onChange={(e) => handleInputChange('joinUrl', e.target.value)}
                placeholder="Enter WhatsApp or registration URL"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonText">Details Button Text</Label>
                <Input
                  id="buttonText"
                  value={event.buttonText || ''}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="e.g., Event Details"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="buttonUrl">Details Button URL</Label>
                <Input
                  id="buttonUrl"
                  value={event.buttonUrl || ''}
                  onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                  placeholder="e.g., /admin or external URL"
                  className="mt-1"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="bg-yoga-sage hover:bg-yoga-forest w-full">
              <Save size={16} className="mr-2" />
              Save Event Details
            </Button>
          </div>

          {/* Event Preview */}
          <div>
            <h3 className="text-lg font-semibold text-yoga-forest mb-4">Preview</h3>
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <img loading="lazy" 
                  src={event.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={event.title || 'Event'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-bold text-yoga-forest mb-2">
                  {event.title || 'Event Title'}
                </h4>
                
                <p className="text-sm text-yoga-forest/80 mb-4 line-clamp-2">
                  {event.description || 'Event description will appear here...'}
                </p>

                <div className="space-y-2 text-sm text-yoga-forest mb-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2 text-yoga-sage" />
                    <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date not set'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-2 text-yoga-sage" />
                    <span>{event.time || 'Time not set'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2 text-yoga-sage" />
                    <span>{event.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-2 text-yoga-sage" />
                    <span>{event.capacity || 'Capacity not set'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-yoga-terracotta">
                    {event.price || 'Price not set'}
                  </span>
                  <Button size="sm" className="bg-yoga-sage hover:bg-yoga-forest">
                    Join Event
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminEvents;
