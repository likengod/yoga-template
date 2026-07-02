import React, { useState } from 'react';
import { Award, Star, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useInstructorsData } from '@/hooks/useInstructorsData';
const Instructors = () => {
  const navigate = useNavigate();
  const { instructors: instructorsData } = useInstructorsData();
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const toggleBio = (name: string) => {
    setExpandedBios(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Sort instructors so that featured ones come first
  const sortedInstructors = [...instructorsData].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Convert stored instructors to display format and add "All Instructors" card
  const instructors = [...sortedInstructors.slice(0, 3).map(instructor => ({
    name: instructor.name,
    title: instructor.title,
    specialization: instructor.specialization,
    experience: instructor.experience,
    certifications: instructor.certifications,
    rating: instructor.rating,
    students: instructor.students,
    description: instructor.description,
    image: instructor.image,
    featured: instructor.featured
  })), {
    name: 'All Instructors',
    title: 'Complete Teaching Team',
    specialization: 'Comprehensive Yoga Education',
    experience: 'Collective 50+ years',
    certifications: ['International Certifications', 'Advanced Training', 'Continuing Education'],
    rating: 4.9,
    students: '1000+',
    description: 'Discover our complete team of certified yoga instructors, each bringing unique expertise and passion to create a comprehensive learning experience for all levels.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80'
  }];
  const handleViewAllInstructors = () => {
    navigate('/instructors');
  };
  const handleEditInstructors = () => {
    navigate('/admin');
    setTimeout(() => {
      const event = new CustomEvent('switchToInstructorsTab');
      window.dispatchEvent(event);
    }, 100);
  };

  // Check if user is logged in as admin
  const currentUser = localStorage.getItem('currentUser');
  const isAdmin = currentUser ? JSON.parse(currentUser).role === 'admin' : false;
  return <section id="instructors" className="py-20 bg-gradient-to-br from-yoga-sand to-yoga-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-4xl lg:text-6xl font-bold text-yoga-forest">
                Meet Our <span className="text-yoga-terracotta">Instructors</span>
              </h2>
          </div>
          <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto leading-relaxed">
            Our team of certified and experienced yoga instructors are passionate about guiding you 
            on your wellness journey with wisdom, compassion, and expertise.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {instructors.map((instructor, index) => (
            <Card key={instructor.name} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col relative" style={{ animationDelay: `${index * 0.1}s` }}>
              
              <div className="relative h-48 overflow-hidden shrink-0">
                <img loading="lazy" 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base lg:text-lg xl:text-xl font-bold text-yoga-forest truncate" title={instructor.name}>{instructor.name}</h3>
                </div>
                
                <p className="text-yoga-terracotta font-medium mb-2 text-sm">{instructor.title}</p>
                <p className="text-yoga-forest/70 text-xs mb-4 line-clamp-1">Specializes in {instructor.specialization}</p>

                {/* Stats */}
                <div className="flex items-center space-x-3 text-xs mb-4">
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="font-medium text-yoga-forest">{instructor.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={14} className="text-yoga-sage" />
                    <span className="text-yoga-forest/70">{instructor.students} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award size={14} className="text-yoga-terracotta" />
                    <span className="text-yoga-forest/70">{instructor.experience}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-yoga-forest/80 text-sm leading-relaxed">
                    {expandedBios[instructor.name] 
                      ? instructor.description 
                      : (instructor.description?.length > 75 
                          ? instructor.description.slice(0, 75) + '... ' 
                          : instructor.description)}
                    
                    {(instructor.description || '').length > 75 && (
                      <button 
                        onClick={() => toggleBio(instructor.name)}
                        className="text-yoga-forest font-bold hover:underline inline-flex items-center ml-1"
                      >
                        {expandedBios[instructor.name] ? 'Show less' : 'Read more detail \u2192'}
                      </button>
                    )}
                  </p>
                </div>

                <div className="space-y-2 mt-auto">
                  <h4 className="font-semibold text-yoga-forest text-sm">Certifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {instructor.certifications.slice(0, 3).map(cert => (
                      <span key={cert} className="px-2 py-0.5 bg-yoga-sage/20 text-yoga-forest text-[11px] rounded-full border border-yoga-sage/30">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {instructor.name === 'All Instructors' && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button className="w-full bg-yoga-forest hover:bg-yoga-sage text-white" onClick={handleViewAllInstructors}>
                      View All Instructors
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="text-center mt-16">
          
        </div>
      </div>
    </section>;
};
export default Instructors;
