import React from 'react';
import { Heart, Leaf, Sun, Users, Award, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageMeta } from '@/hooks/usePageMeta';

const AboutPage = () => {
  usePageMeta({
    title: 'About Us',
    description: 'Learn about SHAKTI YOGA THEME — our story, our mission, and our passionate team dedicated to bringing authentic yoga to your life.',
  });
  const features = [
    {
      icon: Heart,
      title: 'Mindful Practice',
      description: 'Connect with your inner self through mindful yoga practices rooted in ancient traditions.'
    },
    {
      icon: Leaf,
      title: 'Natural Healing',
      description: 'Experience holistic healing that nurtures your body and mind naturally.'
    },
    {
      icon: Sun,
      title: 'Energy Balance',
      description: 'Restore your energy flow and find perfect balance in all aspects of life.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join a supportive community of like-minded individuals on their wellness journey.'
    }
  ];

  const achievements = [
    { icon: Award, number: '15+', label: 'Years of Experience' },
    { icon: Users, number: '1000+', label: 'Students Transformed' },
    { icon: Clock, number: '5000+', label: 'Classes Conducted' },
    { icon: Heart, number: '98%', label: 'Student Satisfaction' }
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'We honor traditional yoga practices while making them accessible to modern practitioners.'
    },
    {
      title: 'Transformation',
      description: 'Every practice is designed to create positive change in mind, body, and spirit.'
    },
    {
      title: 'Community',
      description: 'We foster a supportive environment where everyone feels welcome and valued.'
    },
    {
      title: 'Excellence',
      description: 'We maintain the highest standards in teaching, safety, and student care.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6">
              About <span className="text-yoga-terracotta">SHAKTI YOGA THEME</span>
            </h1>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto leading-relaxed">
              Transforming lives through authentic yoga practices for over 15 years
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img loading="lazy" 
                  src="https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg" 
                  alt="Yoga practice and meditation" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yoga-forest/20 to-transparent"></div>
              </div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-yoga-terracotta/20 rounded-full"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yoga-sage/20 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest">Our <span className="text-yoga-terracotta">Story</span></h2>
                <p className="text-lg text-yoga-forest/80 leading-relaxed">
                  Founded with a vision to bring authentic yoga practices to modern practitioners, 
                  SHAKTI YOGA THEME has been a beacon of transformation for over 15 years. Our journey 
                  began with a simple belief: yoga is not just a practice—it's a way of life.
                </p>
                <p className="text-lg text-yoga-forest/80 leading-relaxed">
                  We combine traditional Hatha, Vinyasa, and Ashtanga yoga with modern wellness 
                  techniques to create a holistic experience that transforms lives. Every class is 
                  designed to honor the sacred tradition of yoga while making it accessible to 
                  practitioners of all levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">Our <span className="text-yoga-terracotta">Philosophy</span></h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              We believe in creating a safe, nurturing environment where you can explore your 
              potential and discover your inner strength.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="text-center p-6 bg-gradient-to-br from-yoga-cream to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-2xl font-bold text-yoga-forest mb-4">{value.title}</h3>
                <p className="text-yoga-forest/70 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">What Makes Us <span className="text-yoga-terracotta">Special</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 bg-white/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <feature.icon className="text-yoga-sage" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-4">{feature.title}</h3>
                <p className="text-yoga-forest/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">Our <span className="text-yoga-terracotta">Impact</span></h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              Numbers that reflect our commitment to transforming lives through yoga
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.label}
                className="text-center p-8 bg-gradient-to-br from-yoga-sage to-yoga-forest rounded-2xl text-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <achievement.icon size={48} className="mx-auto mb-4 text-yoga-cream" />
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-lg opacity-90">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">Visit Our <span className="text-yoga-terracotta">Studio</span></h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              Join us at our peaceful studio space designed for transformation
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="text-yoga-sage" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Location</h3>
                <p className="text-yoga-forest/70">123 Wellness Street<br />Mumbai 400001</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Clock className="text-yoga-sage" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Hours</h3>
                <p className="text-yoga-forest/70">Monday - Sunday<br />6:00 AM - 9:00 PM</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="text-yoga-sage" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Classes</h3>
                <p className="text-yoga-forest/70">All Levels Welcome<br />Small Group Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
